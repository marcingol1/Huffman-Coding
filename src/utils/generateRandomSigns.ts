import type Signs from '../interfaces/Signs';

function generateRandomLetters(length: number = 0): string {
    return Math
        .random()
        .toString(36)
        .slice(2, length + 2);
}

function mapLettersToSigns(signs: string[] = []): Signs {
    const counts: { [sign: string]: number } = {};

    signs.forEach( sign => {
        counts[sign] = (counts[sign] || 0) + 1;
    });

    return {
        stats: { length: signs.length },
        signs,
        counts
    };
}

export default function generateRandomSigns(randomLetters: string = generateRandomLetters(5)): Signs {
    return mapLettersToSigns(randomLetters.split(''));
}
