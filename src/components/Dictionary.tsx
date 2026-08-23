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
 * LZW's answer to the codebook. Nothing here is transmitted: the decoder learns
 * exactly the same entries in the same order, from the codes alone.
 */
export default function Dictionary({ result }: Props) {
    const { entries, alphabet } = result;
    const learned = entries.length - alphabet.length;

    return (
        <section className="panel dictionary" aria-labelledby="dictionary-title">
            <div className="panel__head">
                <h2 className="panel__title" id="dictionary-title">
                    <Icon name="grid"/>
                    Dictionary
                </h2>
                <p className="panel__meta">
                    {alphabet.length} seeded
                    {learned > 0 ? ' · ' + learned + ' learned' : ''}
                </p>
            </div>

            <div className="panel__body">
                {entries.length === 0 ? (
                    <div className="empty">
                        <p className="empty__title">Nothing to encode yet</p>
                        <p className="empty__hint">
                            Type into the source text above, or load one of the samples,
                            to build the dictionary.
                        </p>
                    </div>
                ) : (
                    <div className="codebook__frame">
                        <div className="codebook__scroll">
                            <table className="codebook__table dictionary__table">
                                <caption className="visually-hidden">
                                    Phrase held at each dictionary code
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col" className="codebook__num-head">Code</th>
                                        <th scope="col">Phrase</th>
                                        <th scope="col">Origin</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map( entry => (
                                        <tr key={entry.code}>
                                            <th scope="row" className="num dictionary__code">
                                                {entry.code}
                                            </th>
                                            <td className="dictionary__phrase">
                                                {readable(entry.phrase)}
                                            </td>
                                            <td className="dictionary__origin">
                                                {entry.seeded ? 'alphabet' : 'learned'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <p className="notice notice--info dictionary__notice">
                    <Icon name="alert"/>
                    <span>
                        None of this is sent. The decoder rebuilds the same dictionary in the
                        same order from the codes alone — only the alphabet has to be agreed
                        in advance.
                    </span>
                </p>
            </div>
        </section>
    );
}
