import * as React from 'react';
import './Metrics.css';
import { formatBits, formatDecimal, formatPercent } from '../utils/format';

interface Props {
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

class Metrics extends React.Component<Props> {
    renderReadout = (readout: Readout) => {
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
    }

    render() {
        const { symbolCount, originalBits, encodedBits, averageLength, entropy } = this.props;
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
                label: 'Huffman',
                value: hasData ? formatBits(encodedBits) : PLACEHOLDER,
                unit: 'bits',
                hint: 'Length of the encoded bitstream. The codebook is not counted.'
            },
            {
                label: 'Distinct symbols',
                value: hasData ? String(symbolCount) : PLACEHOLDER,
                unit: symbolCount === 1 ? 'leaf' : 'leaves',
                hint: 'One leaf of the tree per distinct character.'
            },
            {
                label: 'Average code',
                value: hasData ? formatDecimal(averageLength) : PLACEHOLDER,
                unit: 'bits/symbol',
                hint: 'Code length weighted by how often each symbol appears.'
            },
            {
                label: 'Entropy',
                value: hasData ? formatDecimal(entropy) : PLACEHOLDER,
                unit: 'bits/symbol',
                hint: 'Shannon’s lower bound. No code can average less than this.'
            }
        ];

        return (
            <section className="metrics" aria-label="Compression results">
                <dl className="metrics__grid">
                    {readouts.map(this.renderReadout)}
                </dl>
            </section>
        );
    }
}

export default Metrics;
