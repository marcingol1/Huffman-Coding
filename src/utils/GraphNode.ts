export default class GraphNode {
    parent?: GraphNode;
    children?: GraphNode[];
    sign?: string;
    constructor(sign?: string, parent?: GraphNode, children?: GraphNode[]) {
        this.parent = parent;
        this.children = children;
        this.sign = sign;
    }
}