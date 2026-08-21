import * as React from 'react';
import './Composer.css';

interface Props {
    text: string;
    maxLength: number;
    onChange: (text: string) => void;
}

interface Sample {
    label: string;
    value: string;
}

const SAMPLES: Sample[] = [
    { label: 'Sentence', value: 'huffman coding turns frequent symbols into short codes' },
    { label: 'Skewed', value: 'aaaaaaaaaaaaaaaabbbbbbbbccccdde' },
    { label: 'Even split', value: 'abcdabcdabcdabcd' },
    { label: 'DNA', value: 'GATTACAGATTACAGGGTTTACCA' }
];

class Composer extends React.Component<Props> {
    handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
        this.props.onChange(event.target.value);
    }

    handleClear = (): void => {
        this.props.onChange('');
    }

    handleSample = (value: string): void => {
        this.props.onChange(value);
    }

    render() {
        const { text, maxLength } = this.props;
        const used = text.length;
        const remaining = maxLength - used;
        const nearLimit = remaining <= 40;

        return (
            <section className="panel composer" aria-labelledby="composer-title">
                <div className="panel__head">
                    <h2 className="panel__title" id="composer-title">Source text</h2>
                    <button
                        type="button"
                        className="btn btn--quiet btn--sm"
                        onClick={this.handleClear}
                        disabled={!used}
                    >
                        Clear
                    </button>
                </div>

                <div className="panel__body">
                    <label className="composer__label" htmlFor="source-text">
                        Text to encode
                    </label>
                    <p className="composer__helper" id="source-text-help">
                        The tree, the codebook and the bitstream all rebuild as you type.
                    </p>
                    <textarea
                        id="source-text"
                        className="composer__input"
                        value={text}
                        onChange={this.handleChange}
                        maxLength={maxLength}
                        rows={3}
                        spellCheck={false}
                        autoCapitalize="off"
                        autoCorrect="off"
                        aria-describedby="source-text-help source-text-count"
                    />

                    <div className="composer__row">
                        <div className="composer__samples">
                            <span className="composer__samples-label">Load a sample</span>
                            {SAMPLES.map( sample => (
                                <button
                                    key={sample.label}
                                    type="button"
                                    className={'composer__chip'
                                        + (sample.value === text ? ' composer__chip--active' : '')}
                                    onClick={() => this.handleSample(sample.value)}
                                    aria-pressed={sample.value === text}
                                >
                                    {sample.label}
                                </button>
                            ))}
                        </div>
                        <p
                            className={'composer__count num' + (nearLimit ? ' composer__count--warn' : '')}
                            id="source-text-count"
                            aria-live="polite"
                        >
                            {used} / {maxLength}
                        </p>
                    </div>
                </div>
            </section>
        );
    }
}

export default Composer;
