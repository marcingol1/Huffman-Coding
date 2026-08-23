import Sign from './Sign';
import generateRandomSigns from './generateRandomSigns';
import GraphNode from './GraphNode';
import { TREE_BUILDERS, type TreeCoder } from './trees';
import type Signs from '../interfaces/Signs';

interface SerializedNode {
    name: string;
    attributes: {
        p: string;
        code: string;
    };
    children: SerializedNode[];
}

interface NodeCode {
    sign: string;
    code: string;
    count: number;
    p: number;
}

/**
 * Everything downstream of the tree - codes, average length, entropy, the
 * bitstream - is identical whichever coder shaped it, so only the tree build
 * differs between them.
 */
class SymbolCoding {
    coder: TreeCoder;
    initialData: Signs;
    dataSigns: Sign[];
    graphNodes: GraphNode[];
    root?: GraphNode;
    serialized: SerializedNode[];
    nodeCodes: NodeCode[];
    codingLength: number;

    constructor(initialData: Signs = generateRandomSigns('asdasdasdasd'), coder: TreeCoder = 'huffman') {
        this.coder = coder;
        this.initialData = initialData;
        this.dataSigns = initialData
            .signs
            .slice()
            .sort()
            .filter( (el, index, all) => !index || el !== all[index - 1]) // unique signs only
            .map(this.mapStringToSign);
        this.graphNodes = this.dataSigns.map(this.mapSignToGraphNode);

        this.nodeCodes = [];
        this.codingLength = 0;

        this.createGraph();
        if (this.root) {
            this.addCodesToGraphNodes(this.root, '');
            this.countAverageCodingLength(this.root);
        }
        this.nodeCodes.sort(this.compareNodeCodes);

        this.serialized = this.serializeGraph();
    }

    /**
     * A single distinct sign has no branch to encode, so either coder falls back
     * to one bit per sign. Everything else is decided by the tree walk.
     */
    addCodesToGraphNodes = (node: GraphNode, prefix: string): void => {
        const isLeaf = !node.leftLeaf && !node.rightLeaf;
        node.code = isLeaf && !prefix ? '0' : prefix;

        if (node.leftLeaf) {
            this.addCodesToGraphNodes(node.leftLeaf, prefix + '0');
        }
        if (node.rightLeaf) {
            this.addCodesToGraphNodes(node.rightLeaf, prefix + '1');
        }
        if (isLeaf) {
            this.nodeCodes.push({
                sign: node.sign.name,
                code: node.code,
                count: this.getSignCount(node.sign.name),
                p: node.sign.p
            });
        }
    }

    countGraphEntropy = (): number => {
        let entropy = 0;
        this.dataSigns
            .forEach( sign => {
                if (sign.p > 0) {
                    entropy += sign.p * Math.log2( 1 / sign.p);
                }
            });
        return entropy;
    }

    countAverageCodingLength = (node: GraphNode): void => {
        if (node.leftLeaf) {
            this.countAverageCodingLength(node.leftLeaf);
        }
        if (node.rightLeaf) {
            this.countAverageCodingLength(node.rightLeaf);
        }
        if (!node.leftLeaf && !node.rightLeaf) {
            this.codingLength += node.code.length * node.sign.p;
        }
    }

    /** Encodes the source text with the generated codebook. */
    encode = (text: string): string => {
        const codeBySign: { [sign: string]: string } = {};
        this.nodeCodes.forEach( nodeCode => {
            codeBySign[nodeCode.sign] = nodeCode.code;
        });

        return text
            .split('')
            .map( sign => codeBySign[sign] || '')
            .join('');
    }

    mapGraphNodeToSerializedData = (node: GraphNode): SerializedNode => {
        const serializedNode: SerializedNode = {
            name: node.sign.name,
            attributes: {
                p: node.sign.p.toFixed(3),
                code: node.code || ''
            },
            children: []
        };

        if (node.leftLeaf) {
            serializedNode.children.push(this.mapGraphNodeToSerializedData(node.leftLeaf));
        }
        if (node.rightLeaf) {
            serializedNode.children.push(this.mapGraphNodeToSerializedData(node.rightLeaf));
        }

        return serializedNode;
    }

    serializeGraph = (): SerializedNode[] => {
        return this.root ? [this.mapGraphNodeToSerializedData(this.root)] : [];
    }

    mapStringToSign = (sign: string): Sign => {
        return new Sign(sign, this.getSignCount(sign) / this.initialData.stats.length);
    }

    mapSignToGraphNode = (sign: Sign): GraphNode => {
        return new GraphNode(sign);
    }

    createGraph = (): void => {
        this.root = TREE_BUILDERS[this.coder](this.graphNodes);
    }

    private getSignCount = (sign: string): number => {
        return this.initialData.counts[sign] || 0;
    }

    /** Most frequent signs first, then alphabetically, so the codebook is stable. */
    private compareNodeCodes = (a: NodeCode, b: NodeCode): number => {
        if (b.count !== a.count) {
            return b.count - a.count;
        }
        return a.sign < b.sign ? -1 : 1;
    }
}

export type { NodeCode, SerializedNode };
export default SymbolCoding;
