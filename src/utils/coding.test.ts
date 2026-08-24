import SymbolCoding from './coding';
import generateRandomSigns from './generateRandomSigns';
import type { TreeCoder } from './trees';
import lzw from './lzw';

function build(text: string, coder: TreeCoder = 'huffman'): SymbolCoding {
    return new SymbolCoding(generateRandomSigns(text), coder);
}

describe('SymbolCoding, Huffman', () => {
    it('gives every distinct symbol a code', () => {
        const coding = build('abracadabra');
        expect(coding.nodeCodes.length).toBe(5);
        coding.nodeCodes.forEach( nodeCode => expect(nodeCode.code.length).toBeGreaterThan(0));
    });

    it('produces a prefix-free codebook', () => {
        const codes = build('huffman coding turns frequent symbols into short codes')
            .nodeCodes
            .map( nodeCode => nodeCode.code );

        codes.forEach( code => {
            codes.forEach( other => {
                if (code !== other) {
                    expect(other.indexOf(code)).not.toBe(0);
                }
            });
        });
    });

    it('never averages fewer bits per symbol than the entropy', () => {
        const coding = build('the quick brown fox jumps over the lazy dog');
        expect(coding.codingLength).toBeGreaterThanOrEqual(coding.countGraphEntropy() - 1e-9);
        expect(coding.codingLength).toBeLessThan(coding.countGraphEntropy() + 1);
    });

    it('is optimal for a uniform alphabet, where every code is the same length', () => {
        // Four equally likely symbols must cost exactly two bits each.
        const coding = build('abcdabcdabcdabcd');
        expect(coding.codingLength).toBeCloseTo(2, 10);
        coding.nodeCodes.forEach( nodeCode => expect(nodeCode.code.length).toBe(2));
    });

    it('round-trips the source text through the codebook', () => {
        const text = 'mississippi river';
        const coding = build(text);
        const encoded = coding.encode(text);
        const lengthOf = (sign: string) =>
            coding.nodeCodes.filter( nodeCode => nodeCode.sign === sign )[0].code.length;
        const expectedLength = text.split('').map(lengthOf).reduce( (total, n) => total + n );

        expect(encoded.length).toBe(expectedLength);
        expect(encoded).toMatch(/^[01]+$/);
    });

    it('falls back to one bit when there is only one distinct symbol', () => {
        const coding = build('aaaa');
        expect(coding.nodeCodes).toEqual([{ sign: 'a', code: '0', count: 4, p: 1 }]);
        expect(coding.codingLength).toBe(1);
    });

    it('survives empty input instead of throwing', () => {
        const coding = build('');
        expect(coding.nodeCodes).toEqual([]);
        expect(coding.serializeGraph()).toEqual([]);
        expect(coding.encode('')).toBe('');
        expect(coding.countGraphEntropy()).toBe(0);
    });
});

describe('SymbolCoding, Shannon–Fano', () => {
    const TEXTS = [
        'abracadabra',
        'huffman coding turns frequent symbols into short codes',
        'Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace',
        'aaaaaaaaaaaaaaaabbbbbbbbccccdde',
        'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.'
    ];

    it('produces a prefix-free codebook', () => {
        const codes = build(TEXTS[1], 'shannon-fano').nodeCodes.map( nodeCode => nodeCode.code );

        codes.forEach( code => {
            codes.forEach( other => {
                if (code !== other) {
                    expect(other.indexOf(code)).not.toBe(0);
                }
            });
        });
    });

    /* The whole point of the comparison: Huffman is optimal, so Shannon–Fano
       can tie it but can never beat it. */
    it('is never shorter than Huffman', () => {
        TEXTS.forEach( text => {
            const huffman = build(text, 'huffman').codingLength;
            const shannonFano = build(text, 'shannon-fano').codingLength;
            expect(shannonFano).toBeGreaterThanOrEqual(huffman - 1e-9);
        });
    });

    it('still beats a fixed 8-bit encoding, and never averages below the entropy', () => {
        TEXTS.forEach( text => {
            const coding = build(text, 'shannon-fano');
            expect(coding.codingLength).toBeGreaterThanOrEqual(coding.countGraphEntropy() - 1e-9);
            expect(coding.codingLength).toBeLessThan(8);
        });
    });

    it('is strictly worse than Huffman on a distribution that splits badly', () => {
        // Counts 5,2,2,2,2 — the smallest case where the two disagree. The most
        // even cut puts 'a' alone against the rest, which costs more than the
        // pairing Huffman finds from the bottom up.
        const text = 'aaaaabbccddee';
        const huffman = build(text, 'huffman').codingLength;
        const shannonFano = build(text, 'shannon-fano').codingLength;

        expect(huffman).toBeCloseTo(29 / 13, 10);
        expect(shannonFano).toBeCloseTo(30 / 13, 10);
        expect(shannonFano).toBeGreaterThan(huffman);
    });

    it('handles the single-symbol and empty cases like Huffman does', () => {
        expect(build('aaaa', 'shannon-fano').nodeCodes)
            .toEqual([{ sign: 'a', code: '0', count: 4, p: 1 }]);
        expect(build('', 'shannon-fano').nodeCodes).toEqual([]);
        expect(build('', 'shannon-fano').serializeGraph()).toEqual([]);
    });
});

describe('LZW', () => {
    it('seeds the dictionary with the alphabet the text actually uses', () => {
        const result = lzw('abcdabcdabcdabcd');
        expect(result.alphabet).toEqual(['a', 'b', 'c', 'd']);
        expect(result.entries.slice(0, 4).map( entry => entry.phrase )).toEqual(['a', 'b', 'c', 'd']);
        expect(result.entries.slice(0, 4).every( entry => entry.seeded )).toBe(true);
    });

    it('emits phrases that reconstruct the source in order', () => {
        const text = 'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.';
        const result = lzw(text);
        expect(result.steps.map( step => step.phrase ).join('')).toBe(text);
    });

    it('writes each code at the width the dictionary needed at that moment', () => {
        const result = lzw('abcdabcdabcdabcd');
        const widths = result.steps.reduce( (total, step) => total + step.width, 0);
        expect(result.bits.length).toBe(widths);
        expect(result.bits).toMatch(/^[01]+$/);
        // Widths never shrink: the dictionary only grows.
        result.steps.forEach( (step, index) => {
            if (index > 0) {
                expect(step.width).toBeGreaterThanOrEqual(result.steps[index - 1].width);
            }
        });
    });

    it('every emitted code addresses an entry that already existed', () => {
        const result = lzw('Betty Botter bought some butter');
        const byCode = new Map(result.entries.map( entry => [entry.code, entry.phrase] ));
        result.steps.forEach( step => {
            expect(byCode.get(step.code)).toBe(step.phrase);
            expect(step.code).toBeLessThan(1 << step.width);
        });
    });

    /* The reason LZW is worth showing beside the tree coders: it models
       sequences, so the per-symbol entropy bound does not hold it back. */
    it('beats Huffman and the order-0 entropy on repetitive text', () => {
        const text = 'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.';
        const huffman = build(text, 'huffman');
        const bits = lzw(text).bits.length;

        expect(bits).toBe(154);
        expect(bits).toBeLessThan(huffman.encode(text).length);
        expect(bits / text.length).toBeLessThan(huffman.countGraphEntropy());
    });

    it('loses to Huffman on text with little repetition', () => {
        const text = 'huffman coding turns frequent symbols into short codes';
        expect(lzw(text).bits.length)
            .toBeGreaterThan(build(text, 'huffman').encode(text).length);
    });

    it('survives empty input', () => {
        const result = lzw('');
        expect(result.bits).toBe('');
        expect(result.steps).toEqual([]);
        expect(result.entries).toEqual([]);
    });
});
