import Icon from './Icon';
import type { StreamCoding } from '../utils/stream';

interface Props {
    coding: StreamCoding;
}

/**
 * What the tree view is for the tree coders: the shape of the encoding. Every
 * coder without a tree emits a run of tokens, so they all read the same way.
 */
export default function Stream({ coding }: Props) {
    const { stream, streamTitle, streamMeta, streamNote } = coding;

    return (
        <section className="panel stream" aria-labelledby="stream-title">
            <div className="panel__head">
                <h2 className="panel__title" id="stream-title">
                    <Icon name="tree"/>
                    {streamTitle}
                </h2>
                <p className="panel__meta">{streamMeta}</p>
            </div>

            <div className="panel__body">
                {stream.length === 0 ? (
                    <div className="empty stream__empty">
                        <p className="empty__title">Nothing encoded yet</p>
                        <p className="empty__hint">
                            Enter some text above, or load one of the samples, and the coder
                            works through it left to right.
                        </p>
                    </div>
                ) : (
                    <ol className="stream__list">
                        {stream.map( (item, index) => (
                            <li className="stream__item" key={index}>
                                <span className="stream__label">{item.label}</span>
                                <span className="num stream__code">{item.code}</span>
                                <span className="num stream__bits">{item.bits}b</span>
                                <span className="stream__note">{item.note || ''}</span>
                            </li>
                        ))}
                    </ol>
                )}

                <p className="stream__legend">{streamNote}</p>
            </div>
        </section>
    );
}
