import Signs from '../interfaces/Signs';

function generateRandomLetters(length: number = 0): string[] {
    const randomSigns: string[] = Math
        .random()
        .toString(36)
        .slice(2, length + 2)
        .split('');

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

export default function generateRandomSigns(length: number = 0): Signs {
    const signs: string[] = generateRandomLetters(length);

    const finalSigns = mapLettersToSigns(signs);
    return finalSigns;
}