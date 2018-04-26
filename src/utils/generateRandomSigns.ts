import Signs from '../interfaces/Signs';

function generateRandomLetters(length: number = 0): string {
    const randomSigns: string = Math
        .random()
        .toString(36)
        .slice(2, length + 2);

    return randomSigns;
}

function mapLettersToSigns(signs: string[] = []): Signs {
    let mappedSigns: Signs = {
        stats: {
            length: signs.length
        },
        signs
    };

    signs.forEach(sign => {
        if (mappedSigns[sign]) {
            mappedSigns[sign].count = mappedSigns[sign].count + 1;
        } else {
            mappedSigns[sign] = { count: 1 };
        }
    });

    return mappedSigns;
}

export default function generateRandomSigns(randomLetters: string = generateRandomLetters(5)): Signs {
    const randomLettersArray = randomLetters.split('');
    return mapLettersToSigns(randomLettersArray);
}