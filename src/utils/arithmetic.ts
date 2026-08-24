import { displaySymbol } from './format';
import type { StreamCoding, StreamItem } from './stream';

const PRECISION = 32;
const TOP = Math.pow(2, PRECISION);
const HALF = TOP / 2;
const QUARTER = TOP / 4;

interface Band {
    symbol: string;
    count: number;
    low: number;
    high: number;
}

/**
 * Arithmetic coding: the whole message becomes one number. Each symbol narrows
 * an interval by its probability, and the output is whatever bits are needed to
 * name a point inside the final one.
 *
 * Because the interval never has to land on a bit boundary, a symbol can cost a
 * fraction of a bit — which is the one thing Huffman cannot do, and why this
 * coder edges past it on long text.
 *
 * Integer implementation with the usual E1/E2/E3 scaling, so the bitstream shown
 * is the real output rather than an estimate of it.
 */
export default function arithmetic(text: string): StreamCoding {
    const total = text.length;
    const counts = new Map<string, number>();
    text.split('').forEach( sign => counts.set(sign, (counts.get(sign) || 0) + 1));

    const bands: Band[] = [];
    let cumulative = 0;
    Array.from(counts.keys()).sort().forEach( symbol => {
        const count = counts.get(symbol)!;
        bands.push({ symbol, count, low: cumulative, high: cumulative + count });
        cumulative += count;
    });

    const bandOf = new Map<string, Band>(bands.map( band => [band.symbol, band] ));
    const stream: StreamItem[] = [];
    const output: string[] = [];
    let pending = 0;

    const emit = (bit: string) => {
        output.push(bit);
        const opposite = bit === '0' ? '1' : '0';
        while (pending > 0) {
            output.push(opposite);
            pending -= 1;
        }
    };

    let low = 0;
    let high = TOP - 1;

    if (total) {
        text.split('').forEach( sign => {
            const band = bandOf.get(sign)!;
            const range = high - low + 1;
            const before = output.length;

            high = low + Math.floor((range * band.high) / total) - 1;
            low = low + Math.floor((range * band.low) / total);

            for (;;) {
                if (high < HALF) {
                    emit('0');
                } else if (low >= HALF) {
                    emit('1');
                    low -= HALF;
                    high -= HALF;
                } else if (low >= QUARTER && high < 3 * QUARTER) {
                    pending += 1;
                    low -= QUARTER;
                    high -= QUARTER;
                } else {
                    break;
                }
                low = low * 2;
                high = high * 2 + 1;
            }

            const probability = band.count / total;
            stream.push({
                label: displaySymbol(sign).glyph,
                code: probability.toFixed(3),
                bits: output.length - before,
                note: `costs ${(Math.log2(1 / probability)).toFixed(2)} bits of information`
            });
        });

        pending += 1;
        emit(low < QUARTER ? '0' : '1');
    }

    const written = stream.reduce( (sum, item) => sum + item.bits, 0);
    const flush = output.length - written;

    return {
        bits: output.join(''),
        streamTitle: 'Interval narrowing',
        streamMeta: `${stream.length} ${stream.length === 1 ? 'symbol' : 'symbols'}`
            + (flush > 0 ? ` · ${flush} closing ${flush === 1 ? 'bit' : 'bits'}` : ''),
        streamNote: 'Bits are only written when the interval commits to a half, so most symbols '
            + 'emit nothing at all and the cost of one is spread across its neighbours.',
        stream,
        detail: {
            title: 'Probability model',
            columns: ['Symbol', 'Count', 'Probability', 'Interval'],
            rows: bands.map( band => [
                displaySymbol(band.symbol).glyph,
                String(band.count),
                (band.count / total).toFixed(4),
                `${(band.low / total).toFixed(3)} – ${(band.high / total).toFixed(3)}`
            ]),
            numeric: [1, 2],
            mono: [0, 3],
            meta: `${bands.length} ${bands.length === 1 ? 'band' : 'bands'}`,
            note: 'Each symbol owns a slice of [0,1) in proportion to how often it appears. '
                + 'The decoder needs the same table, exactly as Huffman needs its codebook.'
        }
    };
}
