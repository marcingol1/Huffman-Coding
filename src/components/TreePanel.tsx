import * as React from 'react';
import './TreePanel.css';
import Icon from './Icon';
import TreeScene3D from './TreeScene3D';
import TreeFlat from './TreeFlat';
import HuffmanCoding from '../utils/coding';
import layoutTree from '../utils/layoutTree';

interface Props {
    coding: HuffmanCoding;
}

interface State {
    view: string;
    webglFailed: boolean;
}

class TreePanel extends React.Component<Props, State> {
    state: State = {
        view: 'depth',
        webglFailed: false
    };

    private scene: TreeScene3D;

    show = (view: string) => (): void => {
        this.setState({ view });
    }

    /** WebGL can be missing or blocked; drop to the flat view rather than an empty box. */
    handleUnsupported = (): void => {
        this.setState({ view: 'flat', webglFailed: true });
    }

    resetView = (): void => {
        if (this.scene) {
            this.scene.resetView();
        }
    }

    setScene = (instance: TreeScene3D): void => {
        this.scene = instance;
    }

    renderToggle() {
        const { view, webglFailed } = this.state;
        return (
            <div className="tree-panel__toggle" role="group" aria-label="Tree view">
                <button
                    type="button"
                    className={'tree-panel__toggle-btn' + (view === 'depth' ? ' is-active' : '')}
                    onClick={this.show('depth')}
                    aria-pressed={view === 'depth'}
                    disabled={webglFailed}
                >
                    Depth
                </button>
                <button
                    type="button"
                    className={'tree-panel__toggle-btn' + (view === 'flat' ? ' is-active' : '')}
                    onClick={this.show('flat')}
                    aria-pressed={view === 'flat'}
                >
                    Flat
                </button>
            </div>
        );
    }

    render() {
        const coding = this.props.coding;
        const layout = layoutTree(coding.serialized);
        const { view, webglFailed } = this.state;
        const isEmpty = !layout.nodes.length;
        // A three-level tree in a 560px stage is mostly empty box; cap the stage to the tree.
        const stageCap = Math.max(260, 130 + layout.maxDepth * 58);

        return (
            <section className="panel tree-panel" aria-labelledby="tree-title">
                <div className="panel__head">
                    <h2 className="panel__title" id="tree-title">
                        <Icon name="tree"/>
                        Huffman tree
                    </h2>
                    <div className="tree-panel__controls">
                        {view === 'depth' && !isEmpty ? (
                            <button
                                type="button"
                                className="btn btn--quiet btn--sm"
                                onClick={this.resetView}
                            >
                                <Icon name="reset" size={15}/>
                                Reset view
                            </button>
                        ) : null}
                        {this.renderToggle()}
                    </div>
                </div>

                <div className="panel__body">
                    <div className="tree-panel__stage" style={{ maxHeight: stageCap }}>
                        {isEmpty ? (
                            <div className="empty tree-panel__empty">
                                <p className="empty__title">No tree to draw</p>
                                <p className="empty__hint">
                                    Enter some text above and the tree builds itself, one merge of the
                                    two least frequent symbols at a time.
                                </p>
                            </div>
                        ) : view === 'depth' ? (
                            <TreeScene3D
                                ref={this.setScene}
                                layout={layout}
                                onUnsupported={this.handleUnsupported}
                            />
                        ) : (
                            <TreeFlat serialized={coding.serialized}/>
                        )}
                    </div>

                    {webglFailed ? (
                        <p className="notice notice--error tree-panel__notice">
                            <Icon name="alert"/>
                            <span>
                                This browser could not start WebGL, so the depth view is unavailable.
                                The flat view shows the same tree.
                            </span>
                        </p>
                    ) : null}

                    <p className="tree-panel__legend">
                        <span className="tree-panel__key tree-panel__key--zero">0</span>
                        left branch
                        <span className="tree-panel__key tree-panel__key--one">1</span>
                        right branch
                        {isEmpty ? null : (
                            <span className="tree-panel__legend-note">
                                Depth {layout.maxDepth} · {layout.nodes.length}
                                {layout.nodes.length === 1 ? ' node' : ' nodes'}
                            </span>
                        )}
                    </p>
                </div>
            </section>
        );
    }
}

export default TreePanel;
