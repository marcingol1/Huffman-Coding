export default interface Signs {
    stats: {
        length: number;
    };
    signs: string[];
    /** How many times each distinct sign appears in `signs`. */
    counts: { [sign: string]: number };
}
