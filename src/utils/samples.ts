export interface Sample {
    label: string;
    value: string;
}

export interface SampleGroup {
    /** Names what the group is FOR, since that is how you pick one. */
    label: string;
    samples: Sample[];
}

/*
 * Sources: the Shakespeare passages are public domain. The playful group is
 * traditional tongue twisters, a well-known linguistics example, and one piece
 * written for this project — no copyrighted scripts are reproduced here.
 */
const SAMPLE_GROUPS: SampleGroup[] = [
    {
        label: 'Short',
        samples: [
            { label: 'Sentence', value: 'huffman coding turns frequent symbols into short codes' },
            { label: 'Skewed', value: 'aaaaaaaaaaaaaaaabbbbbbbbccccdde' },
            { label: 'Even split', value: 'abcdabcdabcdabcd' },
            { label: 'DNA', value: 'GATTACAGATTACAGGGTTTACCA' },
            // The smallest distribution on which Huffman and Shannon-Fano disagree.
            { label: 'Coder gap', value: 'aaaaabbccddee' }
        ]
    },
    {
        label: 'Prose',
        samples: [
            {
                label: 'Hamlet',
                value: 'To be, or not to be, that is the question: Whether it is nobler in the mind '
                    + 'to suffer the slings and arrows of outrageous fortune, or to take arms '
                    + 'against a sea of troubles and by opposing end them.'
            },
            {
                label: 'Sonnet 18',
                value: 'Shall I compare thee to a summer of a day? Thou art more lovely and more '
                    + 'temperate: rough winds do shake the darling buds of May, and summer has all '
                    + 'too short a date.'
            },
            {
                label: 'Macbeth',
                value: 'Tomorrow, and tomorrow, and tomorrow, creeps in this petty pace from day to '
                    + 'day, to the last syllable of recorded time; and all our yesterdays have '
                    + 'lighted fools the way to dusty death.'
            }
        ]
    },
    {
        label: 'Playful',
        samples: [
            {
                label: 'Buffalo',
                value: 'Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo.'
            },
            {
                label: 'Betty Botter',
                value: 'Betty Botter bought some butter, but she said the butter is bitter. If I put '
                    + 'it in my batter it will make my batter bitter, but a bit of better butter '
                    + 'will make my batter better.'
            },
            {
                label: 'Copypasta',
                value: 'i cannot believe you just spent eight whole bits on the letter e. eight. '
                    + 'bits. do you know how many times e turns up in this sentence? i counted '
                    + 'them. i counted every single one. huffman would never. huffman hands e two '
                    + 'bits and goes home early. meanwhile here you are paying full price for '
                    + 'vowels like some kind of clown.'
            }
        ]
    }
];

export default SAMPLE_GROUPS;
