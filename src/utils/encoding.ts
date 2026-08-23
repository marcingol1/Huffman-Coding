import SymbolCoding from './coding';
import lzw, { type LzwResult } from './lzw';
import generateRandomSigns from './generateRandomSigns';
import { CODERS, type Coder, type TreeCoder } from './trees';
import type Signs from '../interfaces/Signs';

export interface Encoding {
    coder: Coder;
    encoded: string;
    /** Distinct source symbols, however the coder went on to use them. */
    symbolCount: number;
    /** Bits per source character — the one figure comparable across all coders. */
    averageLength: number;
    entropy: number;
    /** Present only for the coders that build a tree. */
    tree?: SymbolCoding;
    /** Present only for LZW. */
    dictionary?: LzwResult;
}

/** Order-0 entropy of the source: a property of the text, not of the coder. */
function entropyOf(signs: Signs): number {
    const total = signs.stats.length;
    if (!total) {
        return 0;
    }

    return Object.keys(signs.counts).reduce( (entropy, sign) => {
        const p = signs.counts[sign] / total;
        return p > 0 ? entropy + p * Math.log2(1 / p) : entropy;
    }, 0);
}

export default function encodeText(text: string, coder: Coder): Encoding {
    const signs = generateRandomSigns(text);
    const entropy = entropyOf(signs);
    const perCharacter = (bits: number) => (text.length ? bits / text.length : 0);

    if (CODERS[coder].buildsTree) {
        const tree = new SymbolCoding(signs, coder as TreeCoder);
        const encoded = tree.encode(text);
        return {
            coder,
            encoded,
            symbolCount: tree.nodeCodes.length,
            averageLength: perCharacter(encoded.length),
            entropy,
            tree
        };
    }

    const dictionary = lzw(text);
    return {
        coder,
        encoded: dictionary.bits,
        symbolCount: dictionary.alphabet.length,
        averageLength: perCharacter(dictionary.bits.length),
        entropy,
        dictionary
    };
}
