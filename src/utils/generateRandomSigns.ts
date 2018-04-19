function generateRandomLetters(length: number = 0): string[] {
    const randomSigns: string[] = Math
        .random()
        .toString(36)
        .slice(2, length + 2)
        .split('');

    return randomSigns;
}

interface Signs {
    stats: {
        length: number
    };
}

function mapLettersToSigns(signs: string[] = []): Signs {
    let mappedSigns: Signs = {
        stats: {
            length: signs.length
        }
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

export default function generateRandomSigns(length: number = 0): Object {
    const signs: string[] = generateRandomLetters(length);

    const finalSigns = mapLettersToSigns(signs);
    return finalSigns;
}