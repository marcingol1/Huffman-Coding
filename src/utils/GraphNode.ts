import Sign from './Sign';

export default class GraphNode {
    parent?: GraphNode;
    leftLeaf?: GraphNode;
    rightLeaf?: GraphNode;
    sign?: Sign;

    constructor(sign?: Sign,
                parent?: GraphNode,
                leftLeaf?: GraphNode,
                rightLeaf?: GraphNode) {

        this.sign = sign;
        this.parent = parent;

        this.leftLeaf = leftLeaf;
        this.rightLeaf = rightLeaf;
    }
}