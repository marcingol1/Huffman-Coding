import Icon from './Icon';
import { displaySymbol } from '../utils/format';
import type { LzwResult } from '../utils/lzw';

interface Props {
    result: LzwResult;
}

function readable(phrase: string): string {
    return phrase.split('').map( sign => displaySymbol(sign).glyph ).join('');
}

/**
 * LZW's answer to the tree view. There is no tree to draw, so the thing worth
 * showing is the chunking: how the text is cut into phrases, what each one
 * costs, and which longer phrase it taught the dictionary.
 */
export default function PhraseStream({ result }: Props) {
    const { steps } = result;
    const learned = steps.filter( step => step.learned ).length;

    return (
        <section className="panel phrases" aria-labelledby="phrases-title">
            <div className="panel__head">
                <h2 className="panel__title" id="phrases-title">
                    <Icon name="tree"/>
                    Phrase stream
                </h2>
                <p className="panel__meta">
                    {steps.length} {steps.length === 1 ? 'phrase' : 'phrases'}
                    {learned > 0 ? ' · ' + learned + ' learned' : ''}
                </p>
            </div>

            <div className="panel__body">
                {steps.length === 0 ? (
                    <div className="empty phrases__empty">
                        <p className="empty__title">No phrases yet</p>
                        <p className="empty__hint">
                            Enter some text above. LZW reads it left to right, emitting the longest
                            phrase it already knows and learning that phrase plus one more symbol.
                        </p>
                    </div>
                ) : (
                    <ol className="phrases__list">
                        {steps.map( (step, index) => (
                            <li className="phrases__item" key={index}>
                                <span className="phrases__phrase">{readable(step.phrase)}</span>
                                <span className="num phrases__code">#{step.code}</span>
                                <span className="num phrases__width">{step.width}b</span>
                                {step.learned ? (
                                    <span className="phrases__learned">
                                        learned <span className="num">#{step.learned.code}</span>
                                        {' '}{readable(step.learned.phrase)}
                                    </span>
                                ) : (
                                    <span className="phrases__learned phrases__learned--none">
                                        final flush
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                )}

                <p className="phrases__legend">
                    Every phrase costs only as many bits as the dictionary needs to address
                    itself, so early codes are cheap and later ones cover more text.
                </p>
            </div>
        </section>
    );
}
