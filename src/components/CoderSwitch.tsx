'use client';

import { CODERS, type Coder } from '../utils/trees';
import './CoderSwitch.css';

const ORDER: Coder[] = ['huffman', 'shannon-fano', 'lzw'];

interface Props {
    coder: Coder;
    onChange: (coder: Coder) => void;
}

export default function CoderSwitch({ coder, onChange }: Props) {
    return (
        <section className="coder" aria-labelledby="coder-label">
            <span className="coder__label" id="coder-label">Coder</span>
            <div className="segmented" role="group" aria-label="Coding algorithm">
                {ORDER.map( option => (
                    <button
                        key={option}
                        type="button"
                        className={'segmented__btn' + (coder === option ? ' is-active' : '')}
                        onClick={() => onChange(option)}
                        aria-pressed={coder === option}
                    >
                        {CODERS[option].label}
                    </button>
                ))}
            </div>
            <p className="coder__rule" aria-live="polite">{CODERS[coder].rule}</p>
        </section>
    );
}
