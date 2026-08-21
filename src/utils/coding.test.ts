import HuffmanCoding from './coding';
import generateRandomSigns from './generateRandomSigns';

function build(text: string): HuffmanCoding {
    return new HuffmanCoding(generateRandomSigns(text));
}

describe('HuffmanCoding', () => {
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
