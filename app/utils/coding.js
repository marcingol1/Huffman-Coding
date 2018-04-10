var HuffmanCoding = (function () {
    function HuffmanCoding(data) {
        if (data === void 0) { data = []; }
    }
    return HuffmanCoding;
})();
var Sign = (function () {
    function Sign(name, p) {
        if (name === void 0) { name = ''; }
        if (p === void 0) { p = 0; }
        this.name = name;
        this.p = p;
    }
    return Sign;
})();
//Example for A, B, C, D, E
/**
 * Generates array of given length with random Signs
 * @param length {number]} - max 9 for now
 */
function generateRandomCode(length) {
    if (length === void 0) { length = 0; }
    var randomSigns = Math.random().toString(36).slice(2, length + 2);
    var randomPercentages = Array.from({ length: length }, function () { return Math.floor(Math.random() * 100); });
    console.log(randomSigns);
    console.log(randomPercentages);
    return [];
}
generateRandomCode(9);
var coding = new HuffmanCoding();
//export default HuffmanCoding; 
