import { formatBits, formatDecimal, formatPercent } from '../utils/format';

interface Props {
    coderLabel: string;
    buildsTree: boolean;
    symbolCount: number;
    originalBits: number;
    encodedBits: number;
    averageLength: number;
    entropy: number;
}

interface Readout {
    label: string;
    value: string;
    unit: string;
    hint: string;
    accent?: boolean;
}

const PLACEHOLDER = '—';

export default function Metrics(props: Props) {
    const {
        coderLabel, buildsTree, symbolCount, originalBits, encodedBits, averageLength, entropy
    } = props;
    const hasData = originalBits > 0;
    const saved = hasData ? (originalBits - encodedBits) / originalBits : 0;

    const readouts: Readout[] = [
        {
            label: 'Space saved',
            value: hasData ? formatPercent(saved) : PLACEHOLDER,
            unit: 'vs 8-bit',
            hint: 'How much smaller the Huffman bitstream is than a fixed 8-bit encoding.',
            accent: true
        },
        {
            label: 'Fixed width',
            value: hasData ? formatBits(originalBits) : PLACEHOLDER,
            unit: 'bits',
            hint: 'Every character stored in 8 bits.'
        },
        {
            label: coderLabel,
            value: hasData ? formatBits(encodedBits) : PLACEHOLDER,
            unit: 'bits',
            hint: buildsTree
                ? 'Length of the encoded bitstream. The codebook is not counted.'
                : 'Length of the encoded bitstream. The dictionary is not sent — '
                    + 'the decoder rebuilds it from the codes.'
        },
        {
            label: 'Distinct symbols',
            value: hasData ? String(symbolCount) : PLACEHOLDER,
            unit: buildsTree
                ? (symbolCount === 1 ? 'leaf' : 'leaves')
                : (symbolCount === 1 ? 'symbol' : 'symbols'),
            hint: buildsTree
                ? 'One leaf of the tree per distinct character.'
                : 'The alphabet LZW seeds its dictionary with.'
        },
        {
            label: 'Average code',
            value: hasData ? formatDecimal(averageLength) : PLACEHOLDER,
            unit: 'bits/symbol',
            hint: buildsTree
                ? 'Code length weighted by how often each symbol appears.'
                : 'Total bits divided by source characters. LZW has no per-symbol code length.'
        },
        {
            label: 'Entropy',
            value: hasData ? formatDecimal(entropy) : PLACEHOLDER,
            unit: 'bits/symbol',
            // Only binds codes that spend a fixed codeword per symbol. LZW does not.
            hint: buildsTree
                ? 'Shannon’s bound for a per-symbol code. Neither tree coder can average less.'
                : 'Shannon’s bound for a per-symbol code. LZW codes whole phrases, so it can '
                    + 'and does go below this.'
        }
    ];

    return (
        <section className="metrics" aria-label="Compression results">
            <dl className="metrics__grid">
                {readouts.map( readout => {
                    const cellClass = 'metrics__cell' + (readout.accent ? ' metrics__cell--accent' : '');
                    const valueClass = 'metrics__value num'
                        + (readout.value === PLACEHOLDER ? ' metrics__value--empty' : '');

                    return (
                        <div key={readout.label} className={cellClass} title={readout.hint}>
                            <dt className="metrics__label">{readout.label}</dt>
                            <dd className={valueClass}>
                                {readout.value}
                                <span className="metrics__unit">{readout.unit}</span>
                            </dd>
                        </div>
                    );
                })}
            </dl>
        </section>
    );
}
