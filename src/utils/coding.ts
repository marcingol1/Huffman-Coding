import Sign from './Sign';
import generateRandomCode from './generateRandomSigns';

class HuffmanCoding {
    data: Sign[];

    constructor(data: Sign[] = generateRandomCode(5)) {
        this.data = data;
        console.info('creating new coding with: ', this.data);
    }

    // first: symbols and their probabilities
    //
}

export default HuffmanCoding;

// export default HuffmanCoding;