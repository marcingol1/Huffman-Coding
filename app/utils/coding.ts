class HuffmanCoding {
    data: Array<Sign>;
    constructor(data = []) {

    }
    //first: symbols and their probabilities
    //
}

class Sign {
    name: string;
    p: number;
    constructor(name = '', p = 0) {
        this.name = name;
        this.p = p;
    }

}

//Example for A, B, C, D, E

/**
 * Generates array of given length with random Signs
 * @param length {number]} - max 9 for now
 */
function generateRandomCode(length: number = 0): Array<Sign> {

    const randomSigns = Math.random().toString(36).slice(2, length + 2);
    const randomPercentages = Array.from({length}, () => Math.floor(Math.random() * 100));

    console.log(randomSigns);
    console.log(randomPercentages);
    return [];
}

generateRandomCode(9);

const coding = new HuffmanCoding();

//export default HuffmanCoding;