import Sign from './Sign';
import generateRandomSigns from './generateRandomSigns';
import GraphNode from './GraphNode';
import Signs from '../interfaces/Signs';

class HuffmanCoding {
    initialData: Signs;
    dataSigns: Sign[];
    graphNodes: GraphNode[];
    root: GraphNode;

    constructor(initialData: Signs = generateRandomSigns(10)) {
        this.initialData = initialData;
        this.dataSigns = initialData
            .signs
            .sort()
            .filter( (el, index) => !index || el !== initialData.signs[index - 1]) // dirty done - get only unique ones
            .map(this.mapStringToSign);
        this.graphNodes = this.dataSigns.map(this.mapSignToGraphNode);

        this.createGraph();
    }

    mapStringToSign = (sign: string): Sign => {
        return new Sign(sign, this.initialData[sign].count / this.initialData.stats.length);
    }

    mapSignToGraphNode = (sign: Sign): GraphNode => {
        return new GraphNode(sign);
    }

    createNewRootNode = (root: GraphNode) => {
        // Create new graph node with no sign
        const rightNode: GraphNode = this.graphNodes
            .reduce( (prev, next) => {
                return next.sign.p < prev.sign.p ? next : prev;
            });
        this.graphNodes = this.graphNodes.filter( filter => filter !== rightNode);

        // Add their propabilities and insert it to graph's sign's p
        const rootSign = new Sign('', root.sign.p + rightNode.sign.p);
        const rootNode = new GraphNode(rootSign, root, rightNode);

        // Overwrite root node
        this.root = rootNode;
    }

    mergeNodes = (node: GraphNode) => {
        // @TODO: create huffman here ;)
    }

    attachNodeLeft = (rootNode: GraphNode, childrenNode: GraphNode): GraphNode => {
        rootNode.leftLeaf = childrenNode;
        childrenNode.parent = rootNode;

        return rootNode;
    }

    attachNodeRight = (rootNode: GraphNode, childrenNode: GraphNode): GraphNode => {
        rootNode.rightLeaf = childrenNode;
        childrenNode.parent = rootNode;

        return rootNode;
    }

    createGraph = (): void => {
        // Get two least probable nodes (and delete them from this.graphNodes)
        const rootNode: GraphNode = this.graphNodes
            .reduce( (prev, next) => {
                return next.sign.p < prev.sign.p ? next : prev;
            });
        this.graphNodes = this.graphNodes.filter( filter => filter !== rootNode);
        this.root = rootNode;

        this.createNewRootNode(this.root);
        console.log(this);
        this.graphNodes.forEach( graphNode => {
            this.createNewRootNode(this.root);
        });

    }

    // first: symbols and their probabilities
    //
}

export default HuffmanCoding;