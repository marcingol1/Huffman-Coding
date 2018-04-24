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
    }

    mapStringToSign = (sign: string): Sign => {
        return new Sign(sign, this.initialData[sign].count / this.initialData.stats.length);
    }

    mapSignToGraphNode = (sign: Sign): GraphNode => {
        return new GraphNode(sign);
    }

    createRootNode = (node: GraphNode) => {
        this.root = node;
    }

    addNodeToGraph = (node: GraphNode) => {
        // @TODO: create huffman here ;)
    }

    createGraph = (signs: Sign[]): void => {
        signs.forEach(this.mapSignToGraphNode);
    }

    // first: symbols and their probabilities
    //
}

export default HuffmanCoding;