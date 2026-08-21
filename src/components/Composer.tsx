'use client';

import type { ChangeEvent } from 'react';

interface Props {
    text: string;
    maxLength: number;
    onChange: (text: string) => void;
}

const SAMPLES = [
    { label: 'Sentence', value: 'huffman coding turns frequent symbols into short codes' },
    { label: 'Skewed', value: 'aaaaaaaaaaaaaaaabbbbbbbbccccdde' },
    { label: 'Even split', value: 'abcdabcdabcdabcd' },
    { label: 'DNA', value: 'GATTACAGATTACAGGGTTTACCA' }
];

export default function Composer({ text, maxLength, onChange }: Props) {
    const used = text.length;
    const nearLimit = maxLength - used <= 40;

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value);

    return (
        <section className="panel composer" aria-labelledby="composer-title">
            <div className="panel__head">
                <h2 className="panel__title" id="composer-title">Source text</h2>
                <button
                    type="button"
                    className="btn btn--quiet btn--sm"
                    onClick={() => onChange('')}
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
                    onChange={handleChange}
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
                                onClick={() => onChange(sample.value)}
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
