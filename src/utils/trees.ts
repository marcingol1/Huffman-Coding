import Sign from './Sign';
import GraphNode from './GraphNode';

export type Coder = 'huffman' | 'shannon-fano' | 'arithmetic' | 'lzw' | 'lz77' | 'rle';

export interface CoderInfo {
    label: string;
    /** One line on how this coder works, shown beside the switch. */
    rule: string;
    /** Only the tree coders get the tree view and the codebook. */
    buildsTree: boolean;
    /**
     * True when the coder spends a codeword per symbol, which is exactly the
     * class Shannon's order-0 bound constrains. The sequence and run coders are
     * not held to it and can go below.
     */
    perSymbol: boolean;
    /** How this coder's bitstream should be read, for the page footer. */
    footer: string;
}

export const CODERS: Record<Coder, CoderInfo> = {
    'huffman': {
        label: 'Huffman',
        rule: 'Builds upward: repeatedly merges the two least probable nodes until one root is left.',
        buildsTree: true,
        perSymbol: true,
        footer: 'Codes are assigned by walking the tree.'
    },
    'shannon-fano': {
        label: 'Shannon–Fano',
        rule: 'Builds downward: sorts the symbols, then splits them at the most even point, over and over.',
        buildsTree: true,
        perSymbol: true,
        footer: 'Codes are assigned by walking the tree.'
    },
    'arithmetic': {
        label: 'Arithmetic',
        rule: 'Turns the whole message into one number: each symbol narrows an interval by its '
            + 'probability, so a symbol can cost a fraction of a bit.',
        buildsTree: false,
        perSymbol: true,
        footer: 'The bitstream names a point inside the final interval — nothing is written until the '
            + 'interval commits to a half.'
    },
    'lzw': {
        label: 'LZW',
        rule: 'Codes repeated phrases, not single symbols: every phrase it emits teaches the '
            + 'dictionary a longer one.',
        buildsTree: false,
        perSymbol: false,
        footer: 'Each code addresses a dictionary phrase, written at the width the dictionary needs at '
            + 'that moment.'
    },
    'lz77': {
        label: 'LZ77',
        rule: 'Points backwards instead of remembering: each token is either a literal or a '
            + 'reference to text already sent.',
        buildsTree: false,
        perSymbol: false,
        footer: 'Each token is either a literal or an offset and length pointing back into text already '
            + 'sent.'
    },
    'rle': {
        label: 'RLE',
        rule: 'Ignores frequency entirely and just counts repeats — unbeatable on runs, '
            + 'ruinous on anything else.',
        buildsTree: false,
        perSymbol: false,
        footer: 'Each pair is a run length and a symbol, eight bits each.'
    }
};

function join(left: GraphNode, right: GraphNode): GraphNode {
    const parent = new GraphNode(new Sign('', left.sign.p + right.sign.p), left, right);
    left.parent = parent;
    right.parent = parent;
    return parent;
}

function takeLeastProbable(queue: GraphNode[]): GraphNode {
    let leastProbableIndex = 0;
    queue.forEach( (node, index) => {
        if (node.sign.p < queue[leastProbableIndex].sign.p) {
            leastProbableIndex = index;
        }
    });

    return queue.splice(leastProbableIndex, 1)[0];
}

/**
 * Textbook Huffman: repeatedly merge the two least probable nodes still in the
 * queue - internal nodes included - until a single root is left. Optimal, in the
 * sense that no prefix code has a shorter weighted average.
 */
export function buildHuffmanTree(nodes: GraphNode[]): GraphNode | undefined {
    const queue = nodes.slice();

    while (queue.length > 1) {
        const left = takeLeastProbable(queue);
        const right = takeLeastProbable(queue);
        queue.push(join(left, right));
    }

    return queue[0];
}

/**
 * Shannon-Fano, the algorithm Huffman was set as a class exercise to beat:
 * sort by probability, cut the list where the two halves are closest in weight,
 * give one side 0 and the other 1, recurse.
 *
 * Splitting top-down cannot see what the split costs further down, so the result
 * is never shorter than Huffman's and is sometimes longer.
 */
export function buildShannonFanoTree(nodes: GraphNode[]): GraphNode | undefined {
    // Descending probability, ties broken by symbol so the tree is deterministic.
    const sorted = nodes.slice().sort( (a, b) =>
        b.sign.p - a.sign.p || (a.sign.name < b.sign.name ? -1 : 1));

    function split(group: GraphNode[]): GraphNode {
        if (group.length === 1) {
            return group[0];
        }

        const total = group.reduce( (sum, node) => sum + node.sign.p, 0);
        let running = 0;
        let bestIndex = 0;
        let bestGap = Infinity;

        // Every cut leaves at least one node on each side.
        for (let i = 0; i < group.length - 1; i += 1) {
            running += group[i].sign.p;
            const gap = Math.abs(2 * running - total);
            if (gap < bestGap) {
                bestGap = gap;
                bestIndex = i;
            }
        }

        return join(split(group.slice(0, bestIndex + 1)), split(group.slice(bestIndex + 1)));
    }

    return sorted.length ? split(sorted) : undefined;
}

export type TreeCoder = 'huffman' | 'shannon-fano';

export const TREE_BUILDERS: Record<TreeCoder, (nodes: GraphNode[]) => GraphNode | undefined> = {
    'huffman': buildHuffmanTree,
    'shannon-fano': buildShannonFanoTree
};
