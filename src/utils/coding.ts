import Sign from './Sign';
import generateRandomSigns from './generateRandomSigns';
import GraphNode from './GraphNode';

class HuffmanCoding {
    initialData: Object;
    data: Sign[];
    root: GraphNode;

    constructor(initialData: Object = generateRandomSigns(5)) {
        this.initialData = initialData;
        // this.data = data.map(this.mapSignToGraphNode);
        console.info('creating new coding with: ', this.data);
        // this.createRootNode(this.data[0]);
        console.log(this);
    }

    mapSignToGraphNode (sign: Sign): GraphNode {

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