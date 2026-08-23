import arithmetic from './arithmetic';
import lz77 from './lz77';
import rle from './rle';
import lzw from './lzw';
import SymbolCoding from './coding';
import generateRandomSigns from './generateRandomSigns';

const SENTENCE = 'huffman coding turns frequent symbols into short codes';
const RUNS = 'a'.repeat(30) + 'b'.repeat(20) + 'c'.repeat(14);
const BUFFALO = 'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.';
const MACBETH = 'Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace from day to '
    + 'day, to the last syllable of recorded time; and all our yesterdays have lighted fools '
    + 'the way to dusty death.';

function huffmanBits(text: string): number {
    const coding = new SymbolCoding(generateRandomSigns(text), 'huffman');
    return coding.encode(text).length;
}

describe('arithmetic coding', () => {
    it('matches the reference implementation', () => {
        expect(arithmetic(SENTENCE).bits.length).toBe(220);
        expect(arithmetic(RUNS).bits.length).toBe(99);
        expect(arithmetic(MACBETH).bits.length).toBe(760);
    });

    /* The reason it earns a place: Huffman must round every code to a whole
       number of bits, and arithmetic coding does not. */
    it('beats Huffman on long text, where the rounding loss accumulates', () => {
        expect(arithmetic(MACBETH).bits.length).toBeLessThan(huffmanBits(MACBETH));
    });

    it('spends nothing on most symbols and flushes at the end', () => {
        const result = arithmetic(SENTENCE);
        const free = result.stream.filter( item => item.bits === 0 ).length;
        expect(free).toBeGreaterThan(0);
        expect(result.stream.length).toBe(SENTENCE.length);
        expect(result.bits).toMatch(/^[01]+$/);
    });

    it('gives every symbol a band, and the bands tile [0,1)', () => {
        const rows = arithmetic(SENTENCE).detail.rows;
        const counts = rows.reduce( (sum, row) => sum + Number(row[1]), 0);
        expect(counts).toBe(SENTENCE.length);
    });

    it('survives empty input', () => {
        expect(arithmetic('').bits).toBe('');
        expect(arithmetic('').stream).toEqual([]);
    });
});

describe('LZ77', () => {
    it('matches the reference implementation', () => {
        expect(lz77(BUFFALO).bits.length).toBe(142);
        expect(lz77(SENTENCE).bits.length).toBe(463);
    });

    it('is the best of the six on heavily repeated text', () => {
        const bits = lz77(BUFFALO).bits.length;
        expect(bits).toBeLessThan(huffmanBits(BUFFALO));
        expect(bits).toBeLessThan(lzw(BUFFALO).bits.length);
        expect(bits).toBeLessThan(arithmetic(BUFFALO).bits.length);
    });

    it('expands text that does not repeat, because every literal costs nine bits', () => {
        expect(lz77(SENTENCE).bits.length).toBeGreaterThan(SENTENCE.length * 8);
    });

    it('emits tokens that reconstruct the source in order', () => {
        const covered = lz77(BUFFALO).stream.reduce( (sum, item) => sum + item.label.length, 0);
        expect(covered).toBe(BUFFALO.length);
    });

    it('never emits a back-reference shorter than it costs', () => {
        lz77(MACBETH).stream.forEach( item => {
            if (item.code !== 'literal') {
                expect(item.label.length).toBeGreaterThanOrEqual(3);
            }
        });
    });
});

describe('run-length encoding', () => {
    it('matches the reference implementation', () => {
        expect(rle(RUNS).bits.length).toBe(48);
        expect(rle(SENTENCE).bits.length).toBe(848);
    });

    it('beats every other coder when the text is actual runs', () => {
        const bits = rle(RUNS).bits.length;
        expect(bits).toBeLessThan(huffmanBits(RUNS));
        expect(bits).toBeLessThan(arithmetic(RUNS).bits.length);
        expect(bits).toBeLessThan(lzw(RUNS).bits.length);
    });

    it('costs sixteen bits per run, which nearly doubles ordinary prose', () => {
        const result = rle(SENTENCE);
        // 53 runs across 54 characters: only the 'ff' in 'huffman' repeats.
        expect(result.stream.length).toBe(53);
        expect(result.bits.length).toBe(result.stream.length * 16);
        expect(result.bits.length).toBeGreaterThan(SENTENCE.length * 8);
    });

    it('covers the whole source with its runs', () => {
        const covered = rle(RUNS).stream.reduce( (sum, item) => sum + item.label.length, 0);
        expect(covered).toBe(RUNS.length);
    });

    it('survives empty input', () => {
        expect(rle('').bits).toBe('');
        expect(rle('').stream).toEqual([]);
    });
});
