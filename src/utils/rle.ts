import { displayPhrase } from './format';
import type { StreamCoding, StreamItem } from './stream';

const COUNT_BITS = 8;
const SYMBOL_BITS = 8;
const MAX_RUN = 255;

/**
 * Run-length encoding: the simplest coder here and the only one that ignores
 * frequency entirely. It writes a count and a symbol per run, so it wins big on
 * long runs and loses badly on anything else — text usually costs it double.
 */
export default function rle(text: string): StreamCoding {
    const stream: StreamItem[] = [];
    const runsBySymbol = new Map<string, { runs: number; longest: number; total: number }>();
    let bits = '';

    let index = 0;
    while (index < text.length) {
        const symbol = text[index];
        let length = 1;
        while (length < MAX_RUN
            && index + length < text.length
            && text[index + length] === symbol) {
            length += 1;
        }

        bits += length.toString(2).padStart(COUNT_BITS, '0')
            + symbol.charCodeAt(0).toString(2).padStart(SYMBOL_BITS, '0');

        stream.push({
            label: displayPhrase(symbol.repeat(length)),
            code: '×' + length,
            bits: COUNT_BITS + SYMBOL_BITS,
            note: length === 1 ? 'run of one — the costly case' : undefined
        });

        const seen = runsBySymbol.get(symbol) || { runs: 0, longest: 0, total: 0 };
        runsBySymbol.set(symbol, {
            runs: seen.runs + 1,
            longest: Math.max(seen.longest, length),
            total: seen.total + length
        });

        index += length;
    }

    const singles = stream.filter( item => item.code === '×1' ).length;
    const rows = Array.from(runsBySymbol.entries())
        .sort( (a, b) => b[1].runs - a[1].runs || (a[0] < b[0] ? -1 : 1))
        .map( ([symbol, stats]) => [
            displayPhrase(symbol),
            String(stats.runs),
            String(stats.longest),
            String(stats.total)
        ]);

    return {
        bits,
        streamTitle: 'Runs',
        streamMeta: `${stream.length} ${stream.length === 1 ? 'run' : 'runs'}`
            + (singles ? ` · ${singles} of length one` : ''),
        streamNote: `Every run costs the same ${COUNT_BITS + SYMBOL_BITS} bits whether it covers `
            + 'two characters or two hundred, which is exactly why runs of one are so expensive.',
        stream,
        detail: {
            title: 'Runs by symbol',
            columns: ['Symbol', 'Runs', 'Longest', 'Total'],
            rows,
            numeric: [1, 2, 3],
            mono: [0],
            meta: `${runsBySymbol.size} ${runsBySymbol.size === 1 ? 'symbol' : 'symbols'}`,
            note: 'A symbol with as many runs as occurrences never repeats, and costs '
                + `${COUNT_BITS + SYMBOL_BITS} bits every time it appears.`
        }
    };
}
