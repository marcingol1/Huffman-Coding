'use client';

import { useMemo, useRef, useState } from 'react';
import Icon from './Icon';
import TreeScene3D from './TreeScene3D';
import type { TreeSceneHandle } from './TreeScene3D';
import TreeFlat from './TreeFlat';
import type SymbolCoding from '../utils/coding';
import layoutTree from '../utils/layoutTree';
import { CODERS } from '../utils/trees';

interface Props {
    coding: SymbolCoding;
}

type View = 'depth' | 'flat';

export default function TreePanel({ coding }: Props) {
    const [view, setView] = useState<View>('depth');
    const [webglFailed, setWebglFailed] = useState(false);
    const scene = useRef<TreeSceneHandle>(null);

    const layout = useMemo(() => layoutTree(coding.serialized), [coding]);
    const isEmpty = !layout.nodes.length;
    // A three-level tree in a 560px stage is mostly empty box; cap the stage to the tree.
    const stageCap = Math.max(260, 130 + layout.maxDepth * 58);

    /** WebGL can be missing or blocked; drop to the flat view rather than an empty box. */
    const handleUnsupported = () => {
        setView('flat');
        setWebglFailed(true);
    };

    return (
        <section className="panel tree-panel" aria-labelledby="tree-title">
            <div className="panel__head">
                <h2 className="panel__title" id="tree-title">
                    <Icon name="tree"/>
                    {CODERS[coding.coder].label} tree
                </h2>
                <div className="tree-panel__controls">
                    {view === 'depth' && !isEmpty ? (
                        <button
                            type="button"
                            className="btn btn--quiet btn--sm"
                            onClick={() => scene.current?.resetView()}
                        >
                            <Icon name="reset" size={15}/>
                            Reset view
                        </button>
                    ) : null}
                    <div className="segmented" role="group" aria-label="Tree view">
                        <button
                            type="button"
                            className={'segmented__btn' + (view === 'depth' ? ' is-active' : '')}
                            onClick={() => setView('depth')}
                            aria-pressed={view === 'depth'}
                            disabled={webglFailed}
                        >
                            Depth
                        </button>
                        <button
                            type="button"
                            className={'segmented__btn' + (view === 'flat' ? ' is-active' : '')}
                            onClick={() => setView('flat')}
                            aria-pressed={view === 'flat'}
                        >
                            Flat
                        </button>
                    </div>
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
                        <TreeScene3D ref={scene} layout={layout} onUnsupported={handleUnsupported}/>
                    ) : (
                        <TreeFlat layout={layout}/>
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
