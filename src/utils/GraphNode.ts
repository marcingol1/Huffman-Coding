import Sign from './Sign';

export default class GraphNode {
    parent?: GraphNode;
    children?: GraphNode[];
    sign: Sign;
    constructor(sign: Sign, parent?: GraphNode, children?: GraphNode[]) {
        this.sign = sign;

        this.parent = parent;
        this.children = children;
    }
}