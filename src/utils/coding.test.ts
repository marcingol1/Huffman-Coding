import SymbolCoding from './coding';
import generateRandomSigns from './generateRandomSigns';
import type { Coder } from './trees';

function build(text: string, coder: Coder = 'huffman'): SymbolCoding {
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
