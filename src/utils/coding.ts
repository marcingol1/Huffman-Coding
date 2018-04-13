import Sign from './Sign';
import generateRandomCode from './generateRandomSigns';

class HuffmanCoding {
    data: Sign[];
    root: GraphNode;

    constructor(data: Sign[] = generateRandomCode(5)) {
        this.data = data;
        console.info('creating new coding with: ', this.data);
    }

    createRootNode(node: GraphNode) {
        this.root = node;
    }

    // first: symbols and their probabilities
    //
}

class GraphNode {
    parent?: GraphNode;
    children?: GraphNode[];
    sign?: string;
    constructor(parent: GraphNode, children: GraphNode[], sign: string) {
        this.parent = parent;
        this.children = children;
        this.sign = sign;
    }
}

export default HuffmanCoding;