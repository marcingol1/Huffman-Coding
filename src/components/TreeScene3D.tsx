'use client';

import { useCallback, useEffect, useImperativeHandle, useRef } from 'react';
import type { Ref, PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from 'react';
import * as THREE from 'three';
import type { LaidOutNode, TreeLayout } from '../utils/layoutTree';
import { displaySymbol } from '../utils/format';

export interface TreeSceneHandle {
    resetView: () => void;
}

interface Props {
    layout: TreeLayout;
    onUnsupported: () => void;
    ref?: Ref<TreeSceneHandle>;
}

const PALETTE = {
    background: 0x0b1220,
    internal: 0x2a3450,
    leaf: 0x14532d,
    accent: 0x22c55e,
    edge: 0x3d4a68,
    label: '#F8FAFC',
    labelMuted: '#A7B4C7'
};

const HOME = { theta: 0, phi: Math.PI / 2 };
const MIN_PHI = 0.35;
const MAX_PHI = Math.PI - 0.35;
const KEY_STEP = 0.12;

export default function TreeScene3D({ layout, onUnsupported, ref }: Props) {
    const host = useRef<HTMLDivElement>(null);
    const renderer = useRef<THREE.WebGLRenderer | null>(null);
    const scene = useRef<THREE.Scene | null>(null);
    const camera = useRef<THREE.PerspectiveCamera | null>(null);
    const graph = useRef<THREE.Group | null>(null);
    const labelCache = useRef<Map<string, THREE.Texture>>(new Map());
    const orbit = useRef({ theta: HOME.theta, phi: HOME.phi, radius: 18 });
    const target = useRef(new THREE.Vector3());
    const frame = useRef(0);
    const drag = useRef<{ x: number; y: number; panning: boolean } | null>(null);
    const pinch = useRef(0);
    const layoutRef = useRef(layout);

    // Kept in a ref so the window-resize listener, registered once, can reframe
    // against the current tree without rebuilding the renderer on every keystroke.
    useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    /* Rendered on demand rather than in a permanent loop — a static tree costs nothing. */
    const draw = useCallback(() => {
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
            const view = camera.current;
            if (!view || !renderer.current || !scene.current) {
                return;
            }
            const { theta, phi, radius } = orbit.current;
            const at = target.current;
            view.position.set(
                at.x + radius * Math.sin(phi) * Math.sin(theta),
                at.y + radius * Math.cos(phi),
                at.z + radius * Math.sin(phi) * Math.cos(theta)
            );
            view.lookAt(at);
            renderer.current.render(scene.current, view);
        });
    }, []);

    const frameCamera = useCallback(() => {
        const view = camera.current;
        if (!view) {
            return;
        }
        const current = layoutRef.current;
        const halfFov = Math.tan((view.fov * Math.PI) / 360);
        const fitHeight = (current.height + 1.6) / (2 * halfFov);
        const fitWidth = (current.width + 1.6) / (2 * (view.aspect || 1) * halfFov);

        orbit.current.radius = Math.min(120, Math.max(7, Math.max(fitHeight, fitWidth) * 1.04));
        target.current.set(0, 0, 0);
    }, []);

    const resize = useCallback(() => {
        const box = host.current;
        const view = camera.current;
        if (!box || !view || !renderer.current || !box.clientWidth || !box.clientHeight) {
            return;
        }
        renderer.current.setSize(box.clientWidth, box.clientHeight, false);
        view.aspect = box.clientWidth / box.clientHeight;
        frameCamera();
        view.updateProjectionMatrix();
        draw();
    }, [draw, frameCamera]);

    const zoom = useCallback((factor: number) => {
        orbit.current.radius = Math.min(120, Math.max(3, orbit.current.radius * factor));
        draw();
    }, [draw]);

    useImperativeHandle(ref, () => ({
        resetView: () => {
            orbit.current.theta = HOME.theta;
            orbit.current.phi = HOME.phi;
            frameCamera();
            draw();
        }
    }), [draw, frameCamera]);

    /* ------------------------------------------------------------ scene setup */

    useEffect(() => {
        const box = host.current;
        // Checked before touching a canvas so three never logs its own context error.
        if (!box || typeof WebGLRenderingContext === 'undefined') {
            onUnsupported();
            return;
        }

        let gl: THREE.WebGLRenderer;
        try {
            gl = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        } catch {
            onUnsupported();
            return;
        }

        gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        gl.setClearColor(PALETTE.background, 1);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.domElement.className = 'scene3d__canvas';
        gl.domElement.tabIndex = 0;
        gl.domElement.setAttribute('role', 'img');
        gl.domElement.setAttribute('aria-label', 'Huffman tree, three-dimensional view');
        box.appendChild(gl.domElement);
        renderer.current = gl;

        /*
         * Key, fill and rim rather than a single ambient wash: the rim is what
         * keeps a node readable against a node behind it once the view is tilted.
         */
        const world = new THREE.Scene();
        world.background = new THREE.Color(PALETTE.background);
        world.fog = new THREE.Fog(PALETTE.background, 22, 68);

        const key = new THREE.DirectionalLight(0xe8f0ff, 2.4);
        key.position.set(5, 8, 10);
        world.add(key);

        const fill = new THREE.DirectionalLight(0x7fa0c8, 1.1);
        fill.position.set(-8, -3, 6);
        world.add(fill);

        const rim = new THREE.DirectionalLight(PALETTE.accent, 0.6);
        rim.position.set(-4, 5, -10);
        world.add(rim);

        world.add(new THREE.HemisphereLight(0x1b2336, 0x080d18, 2.2));

        const view = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
        world.add(view);

        const group = new THREE.Group();
        world.add(group);

        scene.current = world;
        camera.current = view;
        graph.current = group;

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            zoom(event.deltaY > 0 ? 1.09 : 1 / 1.09);
        };

        window.addEventListener('resize', resize);
        // Registered natively so preventDefault sticks: React's wheel handler is passive.
        box.addEventListener('wheel', onWheel, { passive: false });
        resize();

        const textures = labelCache.current;
        return () => {
            window.removeEventListener('resize', resize);
            box.removeEventListener('wheel', onWheel);
            cancelAnimationFrame(frame.current);
            group.traverse( object => {
                const mesh = object as THREE.Mesh;
                mesh.geometry?.dispose();
                const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
                if (Array.isArray(material)) {
                    material.forEach( entry => entry.dispose() );
                } else {
                    material?.dispose();
                }
            });
            textures.forEach( texture => texture.dispose() );
            textures.clear();
            gl.dispose();
            gl.domElement.remove();
        };
    }, [onUnsupported, resize, zoom]);

    /* ----------------------------------------------------------------- graph */

    useEffect(() => {
        const group = graph.current;
        if (!group) {
            return;
        }

        group.traverse( object => {
            const mesh = object as THREE.Mesh;
            mesh.geometry?.dispose();
            const material = mesh.material as THREE.Material | THREE.Material[] | undefined;
            if (Array.isArray(material)) {
                material.forEach( entry => entry.dispose() );
            } else {
                material?.dispose(); // cached label textures survive; only the material goes
            }
        });
        group.clear();

        if (!layout.nodes.length) {
            draw();
            return;
        }

        const textureFor = (glyph: string, color: string, weight: number): THREE.Texture => {
            const cacheKey = `${glyph}|${color}|${weight}`;
            const cached = labelCache.current.get(cacheKey);
            if (cached) {
                return cached;
            }

            const size = 128;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d')!;
            context.font = `${weight} 74px "JetBrains Mono", ui-monospace, monospace`;
            context.fillStyle = color;
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(glyph, size / 2, size / 2 + 4);

            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearFilter;
            labelCache.current.set(cacheKey, texture);
            return texture;
        };

        const internalMaterial = new THREE.MeshStandardMaterial({
            color: PALETTE.internal, roughness: 0.55, metalness: 0.18
        });
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: PALETTE.leaf, roughness: 0.4, metalness: 0.1,
            emissive: PALETTE.accent, emissiveIntensity: 0.08
        });
        const internalGeometry = new THREE.SphereGeometry(0.24, 24, 16);
        const leafGeometry = new THREE.SphereGeometry(0.46, 32, 24);

        const addLabel = (node: LaidOutNode) => {
            const symbol = displaySymbol(node.name);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                map: textureFor(symbol.glyph, PALETTE.label, 700),
                transparent: true,
                depthTest: false
            }));
            sprite.position.set(node.x, node.y, node.z + 0.3);
            sprite.scale.set(0.78, 0.78, 1);
            sprite.renderOrder = 2;
            group.add(sprite);
        };

        layout.nodes.forEach( node => {
            const mesh = node.isLeaf
                ? new THREE.Mesh(leafGeometry, leafMaterial)
                : new THREE.Mesh(internalGeometry, internalMaterial);
            mesh.position.set(node.x, node.y, node.z);
            if (node.isLeaf) {
                mesh.scale.set(1, 1, 0.55); // flattened toward the viewer so the label sits on a dome
                group.add(mesh);
                addLabel(node);
            } else {
                group.add(mesh);
            }
        });

        /* Edges are lit geometry, not flat lines, so a tilted view still reads as depth. */
        layout.edges.forEach( edge => {
            const from = layout.nodes[edge.from];
            const to = layout.nodes[edge.to];
            const start = new THREE.Vector3(from.x, from.y, from.z);
            const end = new THREE.Vector3(to.x, to.y, to.z);
            const span = new THREE.Vector3().subVectors(end, start);
            const isOne = edge.bit === '1';

            const mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(
                    isOne ? 0.045 : 0.035, isOne ? 0.045 : 0.035, span.length(), 8
                ),
                new THREE.MeshStandardMaterial({
                    color: isOne ? PALETTE.accent : PALETTE.edge,
                    roughness: 0.6,
                    metalness: 0.1,
                    emissive: isOne ? PALETTE.accent : 0x000000,
                    emissiveIntensity: isOne ? 0.12 : 0
                })
            );
            mesh.position.copy(start).add(end).multiplyScalar(0.5);
            mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), span.clone().normalize());
            group.add(mesh);

            const label = new THREE.Sprite(new THREE.SpriteMaterial({
                map: textureFor(edge.bit, isOne ? '#4ADE80' : '#B6C2D4', 700),
                transparent: true,
                depthTest: false
            }));
            const sideways = new THREE.Vector3(-span.y, span.x, 0).normalize().multiplyScalar(0.34);
            label.position.copy(start).lerp(end, 0.45).add(sideways).add(new THREE.Vector3(0, 0, 0.3));
            label.scale.set(0.5, 0.5, 1);
            label.renderOrder = 3;
            group.add(label);
        });

        frameCamera();
        draw();
    }, [layout, draw, frameCamera]);

    /* -------------------------------------------------------------- controls */

    const applyDrag = (dx: number, dy: number, panning: boolean) => {
        if (panning) {
            const scale = orbit.current.radius * 0.0016;
            target.current.x -= dx * scale;
            target.current.y += dy * scale;
        } else {
            orbit.current.theta -= dx * 0.006;
            orbit.current.phi = Math.min(MAX_PHI, Math.max(MIN_PHI, orbit.current.phi - dy * 0.006));
        }
        draw();
    };

    const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        drag.current = {
            x: event.clientX,
            y: event.clientY,
            panning: event.button === 2 || event.shiftKey
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const from = drag.current;
        if (!from) {
            return;
        }
        const dx = event.clientX - from.x;
        const dy = event.clientY - from.y;
        drag.current = { ...from, x: event.clientX, y: event.clientY };
        applyDrag(dx, dy, from.panning);
    };

    const onPointerUp = () => {
        drag.current = null;
    };

    // Two fingers pinch to zoom; one finger orbits through the pointer handlers.
    const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        if (event.touches.length === 2) {
            drag.current = null;
            pinch.current = touchSpan(event.touches);
        }
    };

    const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
        if (event.touches.length !== 2 || !pinch.current) {
            return;
        }
        const span = touchSpan(event.touches);
        if (span > 0) {
            zoom(pinch.current / span);
            pinch.current = span;
        }
    };

    const onTouchEnd = () => {
        pinch.current = 0;
    };

    /* Orbiting has to work without a pointer, so the canvas takes arrow keys too. */
    const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
        const step = orbit.current;
        switch (event.key) {
            case 'ArrowLeft': step.theta += KEY_STEP; break;
            case 'ArrowRight': step.theta -= KEY_STEP; break;
            case 'ArrowUp': step.phi = Math.max(MIN_PHI, step.phi - KEY_STEP); break;
            case 'ArrowDown': step.phi = Math.min(MAX_PHI, step.phi + KEY_STEP); break;
            case '+':
            case '=': zoom(1 / 1.15); return;
            case '-':
            case '_': zoom(1.15); return;
            default: return;
        }
        event.preventDefault();
        draw();
    };

    const leaves = layout.nodes.filter( node => node.isLeaf ).length;

    return (
        <div
            className="scene3d"
            ref={host}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onKeyDown={onKeyDown}
            onContextMenu={ event => event.preventDefault() }
        >
            <p className="visually-hidden">
                Three-dimensional Huffman tree with {leaves} leaves. Focus this view and use the
                arrow keys to orbit, plus and minus to zoom.
            </p>
            <p className="scene3d__hint" aria-hidden={true}>
                <span className="scene3d__hint-full">
                    Drag to orbit · Shift-drag to pan · Scroll to zoom
                </span>
                <span className="scene3d__hint-short">Drag to orbit · Pinch to zoom</span>
            </p>
        </div>
    );
}

function touchSpan(touches: React.TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
