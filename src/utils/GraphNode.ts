import Sign from './Sign';

export default class GraphNode {
    parent?: GraphNode;
    leftLeaf?: GraphNode;
    rightLeaf?: GraphNode;
    sign: Sign;
    code: string;

    constructor(sign: Sign,
                leftLeaf?: GraphNode,
                rightLeaf?: GraphNode,
                parent?: GraphNode) {

        this.sign = sign;
        this.parent = parent;

        this.leftLeaf = leftLeaf;
        this.rightLeaf = rightLeaf;
    }

    setCode = (code: string): void => {
        this.code = code;
    }
}