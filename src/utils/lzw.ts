import { displayPhrase } from './format';
import type { StreamCoding } from './stream';

export interface LzwEntry {
    code: number;
    phrase: string;
    /** Seeded entries come from the alphabet; the rest are learned while encoding. */
    seeded: boolean;
}

export interface LzwStep {
    phrase: string;
    code: number;
    /** Bits this code was written with — the width grows as the dictionary does. */
    width: number;
    /** The entry this step taught the dictionary, absent on the final flush. */
    learned?: LzwEntry;
}

export interface LzwResult {
    alphabet: string[];
    entries: LzwEntry[];
    steps: LzwStep[];
    bits: string;
}

/** Enough bits to address every code the dictionary currently holds. */
function widthFor(size: number): number {
    return Math.max(1, (size - 1).toString(2).length);
}

function toBits(code: number, width: number): string {
    let bits = code.toString(2);
    while (bits.length < width) {
        bits = '0' + bits;
    }
    return bits;
}

/**
 * LZW, seeded with the symbols the text actually uses rather than all 256 bytes.
 * A full byte table would spend nine bits on the first code of a four-letter
 * alphabet, which says more about the seeding than about the algorithm.
 *
 * Codes are written at the width the dictionary needs at the moment they are
 * emitted. The decoder grows its dictionary in lockstep, so it always knows how
 * wide the next code is without being told.
 */
export default function lzw(text: string): LzwResult {
    const alphabet = Array.from(new Set(text.split(''))).sort();
    const entries: LzwEntry[] = alphabet.map( (phrase, code) => ({ code, phrase, seeded: true }));
    const steps: LzwStep[] = [];
    const codeOf = new Map<string, number>(alphabet.map( (sign, code) => [sign, code] ));

    if (!text) {
        return { alphabet, entries, steps, bits: '' };
    }

    let bits = '';
    let phrase = '';

    const emit = (matched: string, learned?: LzwEntry) => {
        const width = widthFor(codeOf.size);
        const code = codeOf.get(matched)!;
        bits += toBits(code, width);
        steps.push({ phrase: matched, code, width, learned });
    };

    text.split('').forEach( sign => {
        const extended = phrase + sign;

        if (codeOf.has(extended)) {
            phrase = extended;
            return;
        }

        // `phrase` is the longest match; the dictionary learns it plus one more sign.
        const learned: LzwEntry = { code: codeOf.size, phrase: extended, seeded: false };
        emit(phrase, learned);
        codeOf.set(extended, learned.code);
        entries.push(learned);
        phrase = sign;
    });

    if (phrase) {
        emit(phrase);
    }

    return { alphabet, entries, steps, bits };
}

/** The LZW result dressed in the shape the stream and table components read. */
export function lzwCoding(text: string): StreamCoding {
    const result = lzw(text);
    const learned = result.entries.length - result.alphabet.length;

    return {
        bits: result.bits,
        streamTitle: 'Phrase stream',
        streamMeta: `${result.steps.length} ${result.steps.length === 1 ? 'phrase' : 'phrases'}`
            + (learned > 0 ? ` · ${learned} learned` : ''),
        streamNote: 'Every phrase costs only as many bits as the dictionary needs to address '
            + 'itself, so early codes are cheap and later ones cover more text.',
        stream: result.steps.map( step => ({
            label: displayPhrase(step.phrase),
            code: '#' + step.code,
            bits: step.width,
            note: step.learned
                ? `learned #${step.learned.code} ${displayPhrase(step.learned.phrase)}`
                : 'final flush'
        })),
        detail: {
            title: 'Dictionary',
            columns: ['Code', 'Phrase', 'Origin'],
            rows: result.entries.map( entry => [
                String(entry.code),
                displayPhrase(entry.phrase),
                entry.seeded ? 'alphabet' : 'learned'
            ]),
            numeric: [0],
            mono: [1],
            meta: `${result.alphabet.length} seeded`
                + (learned > 0 ? ` · ${learned} learned` : ''),
            note: 'None of this is sent. The decoder rebuilds the same dictionary in the same '
                + 'order from the codes alone — only the alphabet has to be agreed in advance.'
        }
    };
}
