class HuffmanCoding {
    data: Sign[];

    constructor(data: Sign[] = []) {
        this.data = data;
    }

    // first: symbols and their probabilities
    //
}

class Sign {
    name: string;
    p: number;

    constructor(name: string = '', p: number = 0) {
        this.name = name;
        this.p = p;
    }
}

// Example for A, B, C, D, E

function generateRandomCode(length: number = 0): Sign[] {
    const randomSigns: String[] = Math
        .random()
        .toString(36)
        .slice(2, length + 2)
        .split('');

    const randomPercentages = Array.from({length}, () => Math.floor(Math.random() * 100));

    return randomSigns.map( (sign: string, index: number) => new Sign(sign, randomPercentages[index]));
}

console.log(generateRandomCode(9));

const coding = new HuffmanCoding();

// export default HuffmanCoding;