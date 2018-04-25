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

    createNewRootNode = () => {
        // Get two least probable nodes (and delete them from this.graphNodes)

        // Create new graph node with no sign

        // Add their propabilities and insert it to graph's sign's p

        // Add left node

        // Add right node

        // Overwrite root node
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
        console.log(this.dataSigns, this.graphNodes);
    }

    // first: symbols and their probabilities
    //
}

export default HuffmanCoding;