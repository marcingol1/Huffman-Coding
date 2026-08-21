'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { formatBits, groupBits } from '../utils/format';

interface Props {
    encoded: string;
    originalBits: number;
}

export default function EncodedOutput({ encoded, originalBits }: Props) {
    const [copied, setCopied] = useState(false);
    const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => () => clearTimeout(resetTimer.current), []);

    const confirmCopy = () => {
        setCopied(true);
        clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 2000);
    };

    /** The Clipboard API needs a secure context; a hidden textarea covers the rest. */
    const copyWithSelection = () => {
        const scratch = document.createElement('textarea');
        scratch.value = encoded;
        scratch.setAttribute('readonly', '');
        scratch.style.position = 'fixed';
        scratch.style.opacity = '0';
        document.body.appendChild(scratch);
        scratch.select();
        document.execCommand('copy');
        document.body.removeChild(scratch);
        confirmCopy();
    };

    const copy = () => {
        if (navigator.clipboard?.writeText) {
            navigator.clipboard.writeText(encoded).then(confirmCopy, copyWithSelection);
        } else {
            copyWithSelection();
        }
    };

    const savedBits = originalBits - encoded.length;

    return (
        <section className="panel encoded" aria-labelledby="encoded-title">
            <div className="panel__head">
                <h2 className="panel__title" id="encoded-title">
                    <Icon name="copy"/>
                    Encoded bitstream
                </h2>
                <button
                    type="button"
                    className={'btn btn--sm' + (copied ? ' btn--accent' : '')}
                    onClick={copy}
                    disabled={!encoded}
                >
                    <Icon name={copied ? 'check' : 'copy'} size={15}/>
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            <div className="panel__body">
                {encoded ? (
                    <>
                        <p className="encoded__stream num" aria-label="Encoded bitstream">
                            {groupBits(encoded).map( (group, index) => (
                                <span key={index} className="encoded__group">{group}</span>
                            ))}
                        </p>
                        <p className="encoded__summary" aria-live="polite">
                            <span className="num">{formatBits(encoded.length)}</span> bits
                            <span className="encoded__sep">·</span>
                            <span className="num encoded__saved">{formatBits(savedBits)}</span> saved
                            against {formatBits(originalBits)} at 8 bits per character
                        </p>
                    </>
                ) : (
                    <div className="empty">
                        <p className="empty__title">No bits yet</p>
                        <p className="empty__hint">
                            The encoded stream appears here once the source text has something in it.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}
