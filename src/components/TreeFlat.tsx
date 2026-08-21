'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { TreeLayout } from '../utils/layoutTree';
import { displaySymbol } from '../utils/format';

interface Props {
    layout: TreeLayout;
}

/** Layout units are abstract; this turns one into a comfortable number of pixels. */
const SCALE = 42;
const PADDING = 34;
const LEAF_RADIUS = 15;
const NODE_RADIUS = 7;

interface View {
    x: number;
    y: number;
    k: number;
}

export default function TreeFlat({ layout }: Props) {
    const host = useRef<HTMLDivElement>(null);
    const drag = useRef<{ x: number; y: number } | null>(null);
    const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });

    const bounds = useMemo(() => {
        if (!layout.nodes.length) {
            return { minX: 0, maxX: 0, minY: 0, maxY: 0, width: 0, height: 0 };
        }
        const xs = layout.nodes.map( node => node.x * SCALE );
        const ys = layout.nodes.map( node => -node.y * SCALE );
        const minX = Math.min(...xs) - PADDING;
        const maxX = Math.max(...xs) + PADDING;
        const minY = Math.min(...ys) - PADDING;
        const maxY = Math.max(...ys) + PADDING;
        return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
    }, [layout]);

    /** Fit the whole tree, then centre it, whenever the tree or the box changes. */
    const fit = useCallback(() => {
        const box = host.current;
        if (!box || !bounds.width || !bounds.height) {
            return;
        }
        const k = Math.min(1.6, (box.clientWidth - 16) / bounds.width,
                           (box.clientHeight - 16) / bounds.height);
        setView({
            x: box.clientWidth / 2 - ((bounds.minX + bounds.maxX) / 2) * k,
            y: box.clientHeight / 2 - ((bounds.minY + bounds.maxY) / 2) * k,
            k
        });
    }, [bounds]);

    useEffect(() => {
        fit();
        const box = host.current;
        if (!box || typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(fit);
        observer.observe(box);
        return () => observer.disconnect();
    }, [fit]);

    useEffect(() => {
        const box = host.current;
        if (!box) {
            return;
        }
        // Registered natively so preventDefault sticks: React's wheel handler is passive.
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            const factor = event.deltaY > 0 ? 1 / 1.12 : 1.12;
            const rect = box.getBoundingClientRect();
            const px = event.clientX - rect.left;
            const py = event.clientY - rect.top;
            setView( current => {
                const k = Math.min(4, Math.max(0.1, current.k * factor));
                const ratio = k / current.k;
                return { k, x: px - (px - current.x) * ratio, y: py - (py - current.y) * ratio };
            });
        };
        box.addEventListener('wheel', onWheel, { passive: false });
        return () => box.removeEventListener('wheel', onWheel);
    }, []);

    const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        drag.current = { x: event.clientX, y: event.clientY };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
        const from = drag.current;
        if (!from) {
            return;
        }
        const dx = event.clientX - from.x;
        const dy = event.clientY - from.y;
        drag.current = { x: event.clientX, y: event.clientY };
        setView( current => ({ ...current, x: current.x + dx, y: current.y + dy }));
    };

    const endDrag = () => {
        drag.current = null;
    };

    const leaves = layout.nodes.filter( node => node.isLeaf ).length;

    return (
        <div
            className="tree-flat"
            ref={host}
            onPointerDown={startDrag}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <svg className="tree-flat__canvas" role="img"
                 aria-label={`Huffman tree, flat view, ${leaves} leaves`}>
                <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
                    {layout.edges.map( edge => {
                        const from = layout.nodes[edge.from];
                        const to = layout.nodes[edge.to];
                        const x1 = from.x * SCALE;
                        const y1 = -from.y * SCALE;
                        const x2 = to.x * SCALE;
                        const y2 = -to.y * SCALE;
                        const isOne = edge.bit === '1';

                        return (
                            <g key={`${edge.from}-${edge.to}`}>
                                <line
                                    className={isOne ? 'tree-flat__edge tree-flat__edge--one'
                                                     : 'tree-flat__edge'}
                                    x1={x1} y1={y1} x2={x2} y2={y2}
                                />
                                <text
                                    className={isOne ? 'tree-flat__bit tree-flat__bit--one'
                                                     : 'tree-flat__bit'}
                                    x={x1 + (x2 - x1) * 0.42 + (isOne ? 9 : -9)}
                                    y={y1 + (y2 - y1) * 0.42}
                                >
                                    {edge.bit}
                                </text>
                            </g>
                        );
                    })}

                    {layout.nodes.map( node => {
                        const symbol = displaySymbol(node.name);
                        return (
                            <g key={node.id} transform={`translate(${node.x * SCALE} ${-node.y * SCALE})`}>
                                <circle
                                    className={node.isLeaf ? 'tree-flat__leaf' : 'tree-flat__node'}
                                    r={node.isLeaf ? LEAF_RADIUS : NODE_RADIUS}
                                />
                                {node.isLeaf ? (
                                    <text className="tree-flat__symbol" y={4}>{symbol.glyph}</text>
                                ) : null}
                            </g>
                        );
                    })}
                </g>
            </svg>
            <p className="tree-flat__hint" aria-hidden={true}>Drag to pan · Scroll to zoom</p>
        </div>
    );
}
