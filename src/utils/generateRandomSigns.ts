import Sign from './Sign';

export default function generateRandomCode(length: number = 0): Sign[] {
    const randomSigns: String[] = Math
        .random()
        .toString(36)
        .slice(2, length + 2)
        .split('');

    let all = 100;
    const randomPercentages = Array.from({length}, () =>  {
        const random = Math.floor(Math.random() * 100 / 4);
        all -= random;
        return all < 0 ? 14 : random;
    });

    // Sum of percentages needs to be validaded to be 100 -> last element sums rest
    const percentagesSum = randomPercentages.reduce( (prev, next) => prev + next);
    if ( percentagesSum < 100) {
        randomPercentages[randomPercentages.length - 1] += 100 - percentagesSum;
    }
    return randomSigns.map( (sign: string, index: number) => new Sign(sign, randomPercentages[index]));
}