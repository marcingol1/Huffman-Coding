import { displayPhrase } from './format';
import type { StreamCoding, StreamItem } from './stream';

const WINDOW = 255;
const MIN_MATCH = 3;
const MAX_MATCH = 18;
const FLAG_BITS = 1;
const LITERAL_BITS = 8;
const OFFSET_BITS = 8;
const LENGTH_BITS = 4;

const MATCH_COST = FLAG_BITS + OFFSET_BITS + LENGTH_BITS;
const LITERAL_COST = FLAG_BITS + LITERAL_BITS;

interface Match {
    offset: number;
    length: number;
}

function longestMatch(text: string, at: number): Match {
    let best: Match = { offset: 0, length: 0 };
    const from = Math.max(0, at - WINDOW);

    for (let start = from; start < at; start += 1) {
        let length = 0;
        while (length < MAX_MATCH
            && at + length < text.length
            && text[start + length] === text[at + length]) {
            length += 1;
        }
        if (length > best.length) {
            best = { offset: at - start, length };
        }
    }

    return best;
}

/**
 * LZ77 in its LZSS form: instead of a dictionary of codes, every token either
 * carries a literal or points backwards into the text already sent. Same family
 * as LZW, opposite mechanism — nothing is remembered but the recent past.
 *
 * A match is only worth writing when it beats the literals it replaces, so
 * matches shorter than MIN_MATCH are never emitted.
 */
export default function lz77(text: string): StreamCoding {
    const stream: StreamItem[] = [];
    let bits = '';
    let literals = 0;
    let matches = 0;
    let matchedCharacters = 0;
    let index = 0;

    while (index < text.length) {
        const best = longestMatch(text, index);

        if (best.length >= MIN_MATCH) {
            bits += '1'
                + best.offset.toString(2).padStart(OFFSET_BITS, '0')
                + (best.length - MIN_MATCH).toString(2).padStart(LENGTH_BITS, '0');
            stream.push({
                label: displayPhrase(text.slice(index, index + best.length)),
                code: `@${best.offset}·${best.length}`,
                bits: MATCH_COST,
                note: `seen ${best.offset} back`
            });
            matches += 1;
            matchedCharacters += best.length;
            index += best.length;
            continue;
        }

        bits += '0' + text.charCodeAt(index).toString(2).padStart(LITERAL_BITS, '0');
        stream.push({
            label: displayPhrase(text[index]),
            code: 'literal',
            bits: LITERAL_COST
        });
        literals += 1;
        index += 1;
    }

    const averageMatch = matches ? matchedCharacters / matches : 0;

    return {
        bits,
        streamTitle: 'Token stream',
        streamMeta: `${literals} ${literals === 1 ? 'literal' : 'literals'} · `
            + `${matches} ${matches === 1 ? 'match' : 'matches'}`,
        streamNote: `A literal costs ${LITERAL_COST} bits and a back-reference ${MATCH_COST}, `
            + `so a match only pays once it covers ${MIN_MATCH} characters or more.`,
        stream,
        detail: {
            title: 'Token cost',
            columns: ['Token', 'Count', 'Bits each', 'Total bits'],
            rows: [
                ['Literal', String(literals), String(LITERAL_COST), String(literals * LITERAL_COST)],
                ['Back-reference', String(matches), String(MATCH_COST), String(matches * MATCH_COST)]
            ],
            numeric: [1, 2, 3],
            meta: matches
                ? `matches average ${averageMatch.toFixed(1)} characters`
                : 'no repetition found',
            note: `The window reaches ${WINDOW} characters back and a match covers at most `
                + `${MAX_MATCH}, so repetition further away than that is invisible to it.`
        }
    };
}
