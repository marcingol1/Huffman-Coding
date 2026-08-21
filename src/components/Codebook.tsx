import Icon from './Icon';
import type { NodeCode } from '../utils/coding';
import { displaySymbol, formatPercent } from '../utils/format';

interface Props {
    nodeCodes: NodeCode[];
    totalSigns: number;
}

/** Bars are scaled against the most frequent symbol, so the column always uses its full width. */
function barWidth(share: number, peak: number): string {
    if (peak <= 0) {
        return '0%';
    }
    return Math.max(4, (share / peak) * 100).toFixed(1) + '%';
}

function Row({ nodeCode, peak }: { nodeCode: NodeCode; peak: number }) {
    const symbol = displaySymbol(nodeCode.sign);

    return (
        <tr>
            <th scope="row" className="codebook__symbol">
                <span
                    className={'codebook__glyph' + (symbol.isWhitespace ? ' codebook__glyph--ws' : '')}
                    title={symbol.label}
                >
                    {symbol.glyph}
                </span>
                <span className="visually-hidden">{symbol.label}</span>
            </th>
            <td className="num codebook__count">{nodeCode.count}</td>
            <td className="codebook__share">
                <div className="codebook__share-cell">
                    <span className="codebook__track" aria-hidden={true}>
                        <span className="codebook__bar" style={{ width: barWidth(nodeCode.p, peak) }}/>
                    </span>
                    <span className="num codebook__share-value">{formatPercent(nodeCode.p)}</span>
                </div>
            </td>
            <td className="codebook__code">
                {nodeCode.code.split('').map( (bit, index) => (
                    <span
                        key={index}
                        className={bit === '1' ? 'codebook__bit codebook__bit--one' : 'codebook__bit'}
                    >
                        {bit}
                    </span>
                ))}
            </td>
            <td className="num codebook__length">{nodeCode.code.length}</td>
        </tr>
    );
}

export default function Codebook({ nodeCodes, totalSigns }: Props) {
    const peak = nodeCodes.reduce( (top, nodeCode) => Math.max(top, nodeCode.p), 0);

    return (
        <section className="panel codebook" aria-labelledby="codebook-title">
            <div className="panel__head">
                <h2 className="panel__title" id="codebook-title">
                    <Icon name="grid"/>
                    Codebook
                </h2>
                <p className="panel__meta">
                    {nodeCodes.length} {nodeCodes.length === 1 ? 'symbol' : 'symbols'}
                    {totalSigns > 0 ? ' · ' + totalSigns + ' characters' : ''}
                </p>
            </div>

            <div className="panel__body">
                {nodeCodes.length === 0 ? (
                    <div className="empty">
                        <p className="empty__title">Nothing to encode yet</p>
                        <p className="empty__hint">
                            Type into the source text above, or load one of the samples,
                            to fill the codebook.
                        </p>
                    </div>
                ) : (
                    <div className="codebook__frame">
                        <div className="codebook__scroll">
                            <table className="codebook__table">
                                <caption className="visually-hidden">
                                    Huffman code assigned to each distinct character
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Symbol</th>
                                        <th scope="col" className="codebook__num-head">Count</th>
                                        <th scope="col">Share</th>
                                        <th scope="col">Code</th>
                                        <th scope="col" className="codebook__num-head">Bits</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {nodeCodes.map( nodeCode => (
                                        <Row key={'code-' + nodeCode.sign} nodeCode={nodeCode} peak={peak}/>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {nodeCodes.length === 1 ? (
                    <p className="notice notice--info codebook__notice">
                        <Icon name="alert"/>
                        <span>
                            A single distinct symbol has no branch to encode. Huffman falls back
                            to one bit per symbol, so nothing is saved here.
                        </span>
                    </p>
                ) : null}
            </div>
        </section>
    );
}
