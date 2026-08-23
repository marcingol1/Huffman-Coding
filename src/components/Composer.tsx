'use client';

import type { ChangeEvent } from 'react';
import SAMPLE_GROUPS from '../utils/samples';

interface Props {
    text: string;
    maxLength: number;
    onChange: (text: string) => void;
}

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
                    Everything below rebuilds as you type.
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
                <p
                    className={'composer__count num' + (nearLimit ? ' composer__count--warn' : '')}
                    id="source-text-count"
                    aria-live="polite"
                >
                    {used} / {maxLength}
                </p>

                <div className="composer__samples">
                    <p className="composer__samples-title" id="samples-title">Load a sample</p>
                    {SAMPLE_GROUPS.map( group => (
                        <div
                            className="composer__group"
                            key={group.label}
                            role="group"
                            aria-label={group.label + ' samples'}
                        >
                            <span className="composer__group-label">{group.label}</span>
                            <div className="composer__chips">
                                {group.samples.map( sample => (
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
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
