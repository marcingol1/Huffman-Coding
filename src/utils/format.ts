interface DisplaySymbol {
    glyph: string;
    label: string;
    isWhitespace: boolean;
}

const WHITESPACE_NAMES: { [sign: string]: string } = {
    ' ': 'space',
    '\n': 'newline',
    '\t': 'tab',
    '\r': 'carriage return'
};

const WHITESPACE_GLYPHS: { [sign: string]: string } = {
    ' ': '␣',  // ␣
    '\n': '⏎', // ⏎
    '\t': '⇥', // ⇥
    '\r': '↩'  // ↩
};

/**
 * A space and a tab both render as nothing, which makes a codebook row
 * unreadable. Swap in a visible glyph and keep the real name for screen
 * readers and tooltips.
 */
export function displaySymbol(sign: string): DisplaySymbol {
    if (WHITESPACE_NAMES[sign]) {
        return {
            glyph: WHITESPACE_GLYPHS[sign],
            label: WHITESPACE_NAMES[sign],
            isWhitespace: true
        };
    }

    return {
        glyph: sign,
        label: sign,
        isWhitespace: false
    };
}

export function formatBits(bits: number): string {
    return bits.toLocaleString('en-US');
}

export function formatDecimal(value: number, places: number = 3): string {
    if (!isFinite(value)) {
        return '0.000';
    }
    return value.toFixed(places);
}

export function formatPercent(ratio: number, places: number = 1): string {
    if (!isFinite(ratio)) {
        return '0.0%';
    }
    return (ratio * 100).toFixed(places) + '%';
}

/** Splits a bitstream into byte-sized groups so the eye has something to hold on to. */
export function groupBits(bits: string, size: number = 8): string[] {
    const groups: string[] = [];
    for (let i = 0; i < bits.length; i += size) {
        groups.push(bits.slice(i, i + size));
    }
    return groups;
}
