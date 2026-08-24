import Icon from './Icon';
import type { DetailTable as Spec } from '../utils/stream';

interface Props {
    detail: Spec;
}

/** The codebook's counterpart for every coder that does not build one. */
export default function DetailTable({ detail }: Props) {
    const numeric = new Set(detail.numeric || []);
    const mono = new Set(detail.mono || []);
    const classFor = (index: number) => [
        numeric.has(index) ? 'num detail__numeric' : '',
        mono.has(index) ? 'detail__mono' : ''
    ].filter(Boolean).join(' ');

    return (
        <section className="panel detail" aria-labelledby="detail-title">
            <div className="panel__head">
                <h2 className="panel__title" id="detail-title">
                    <Icon name="grid"/>
                    {detail.title}
                </h2>
                {detail.meta ? <p className="panel__meta">{detail.meta}</p> : null}
            </div>

            <div className="panel__body">
                {detail.rows.length === 0 ? (
                    <div className="empty">
                        <p className="empty__title">Nothing to encode yet</p>
                        <p className="empty__hint">
                            Type into the source text above, or load one of the samples.
                        </p>
                    </div>
                ) : (
                    <div className="codebook__frame">
                        <div className="codebook__scroll">
                            <table className="codebook__table">
                                <caption className="visually-hidden">{detail.title}</caption>
                                <thead>
                                    <tr>
                                        {detail.columns.map( (column, index) => (
                                            <th
                                                scope="col"
                                                key={column}
                                                className={numeric.has(index)
                                                    ? 'codebook__num-head' : ''}
                                            >
                                                {column}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {detail.rows.map( (row, rowIndex) => (
                                        <tr key={rowIndex}>
                                            {row.map( (cell, index) => (
                                                index === 0 ? (
                                                    <th
                                                        scope="row"
                                                        key={index}
                                                        className={'detail__head ' + classFor(index)}
                                                    >
                                                        {cell}
                                                    </th>
                                                ) : (
                                                    <td key={index} className={classFor(index)}>
                                                        {cell}
                                                    </td>
                                                )
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {detail.note ? (
                    <p className="notice notice--info detail__notice">
                        <Icon name="alert"/>
                        <span>{detail.note}</span>
                    </p>
                ) : null}
            </div>
        </section>
    );
}
