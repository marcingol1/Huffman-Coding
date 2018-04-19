import Sign from './Sign';
import generateRandomSigns from './generateRandomSigns';
import GraphNode from './GraphNode';
import Signs from '../interfaces/Signs';

class HuffmanCoding {
    initialData: Signs;
    data: Sign[];
    root: GraphNode;

    constructor(initialData: Signs = generateRandomSigns(5)) {
        this.initialData = initialData;
        // this.data = initialData.signs.map(this.mapSignToGraphNode);
        // this.createRootNode(this.data[0]);
    }

    mapSignToGraphNode (signs: Sign): GraphNode {
        return new GraphNode();
    }

    createRootNode(node: GraphNode) {
        this.root = node;
    }

    addNodeToGraph(node: GraphNode) {
        // @TODO: create huffman here ;)
    }

    codeAllData() {
        console.log('hello');
    }

    // first: symbols and their probabilities
    //
}
export default HuffmanCoding;