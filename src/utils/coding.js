var generateRandomSigns_1 = require('./generateRandomSigns');
var HuffmanCoding = (function () {
    function HuffmanCoding(data) {
        if (data === void 0) { data = generateRandomSigns_1["default"](5); }
        //this.data = data.map(this.mapSignToGraphNode);
        console.info('creating new coding with: ', this.data);
        //this.createRootNode(this.data[0]);
        console.log(this);
    }
    HuffmanCoding.prototype.mapSignToGraphNode = function (sign) {
        return new GraphNode();
    };
    HuffmanCoding.prototype.createRootNode = function (node) {
        this.root = node;
    };
    HuffmanCoding.prototype.addNodeToGraph = function (node) {
        // @TODO: create huffman here ;)
    };
    HuffmanCoding.prototype.codeAllData = function () {
    };
    return HuffmanCoding;
})();
var GraphNode = (function () {
    function GraphNode(sign, parent, children) {
        this.parent = parent;
        this.children = children;
        this.sign = sign;
    }
    return GraphNode;
})();
exports["default"] = HuffmanCoding;
