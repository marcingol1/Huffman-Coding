import * as React from 'react';
import * as THREE from 'three';
import './TreeScene3D.css';
import { LaidOutNode, TreeLayout } from '../utils/layoutTree';
import { displaySymbol } from '../utils/format';

interface Props {
    layout: TreeLayout;
    onUnsupported: () => void;
}

/** WebGLRenderingContext predates this project's lib.dom, so it is described here. */
interface WebGLCapableWindow {
    WebGLRenderingContext?: {};
}

interface Orbit {
    theta: number;
    phi: number;
    radius: number;
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

const HOME: Orbit = { theta: 0, phi: Math.PI / 2, radius: 18 };
const MIN_PHI = 0.35;
const MAX_PHI = Math.PI - 0.35;
const KEY_STEP = 0.12;

class TreeScene3D extends React.Component<Props> {
    private host: HTMLDivElement;
    private renderer;
    private scene;
    private camera;
    private graph;
    private labelCache: { [glyph: string]: THREE.Texture } = {};
    private orbit: Orbit = { theta: HOME.theta, phi: HOME.phi, radius: HOME.radius };
    private target = new THREE.Vector3();
    private frame: number;
    private dragging = false;
    private panning = false;
    private lastPointer = { x: 0, y: 0 };
    private pinchDistance = 0;
    private supported = true;

    componentDidMount() {
        if (!this.createRenderer()) {
            this.supported = false;
            this.props.onUnsupported();
            return;
        }
        this.buildScene();
        this.rebuildGraph();
        window.addEventListener('resize', this.resize);
        // Registered natively so preventDefault sticks: React's wheel handler is passive here.
        this.host.addEventListener('wheel', this.handleWheel, { passive: false });
        this.resize();
    }

    componentDidUpdate(prevProps: Props) {
        if (this.supported && prevProps.layout.signature !== this.props.layout.signature) {
            this.rebuildGraph();
            this.frameCamera();
            this.draw();
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.resize);
        if (this.host) {
            this.host.removeEventListener('wheel', this.handleWheel);
        }
        window.cancelAnimationFrame(this.frame);
        this.disposeGraph();
        Object.keys(this.labelCache).forEach( key => this.labelCache[key].dispose() );
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }
    }

    /* ------------------------------------------------------------- scene setup */

    createRenderer = (): boolean => {
        // Checked before touching a canvas so three never logs its own context error.
        if (!(window as WebGLCapableWindow).WebGLRenderingContext) {
            return false;
        }
        try {
            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            renderer.setClearColor(PALETTE.background, 1);
            renderer.outputEncoding = THREE.sRGBEncoding;
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.05;
            renderer.domElement.className = 'scene3d__canvas';
            renderer.domElement.setAttribute('tabindex', '0');
            renderer.domElement.setAttribute('role', 'img');
            renderer.domElement.setAttribute('aria-label', 'Huffman tree, three-dimensional view');
            this.host.appendChild(renderer.domElement);
            this.renderer = renderer;
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Key, fill and rim rather than a single ambient wash: the rim is what keeps
     * a node readable against a node behind it once the view is tilted.
     */
    buildScene = (): void => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(PALETTE.background);
        scene.fog = new THREE.Fog(PALETTE.background, 22, 68);

        const key = new THREE.DirectionalLight(0xe8f0ff, 1.1);
        key.position.set(5, 8, 10);
        scene.add(key);

        const fill = new THREE.DirectionalLight(0x7fa0c8, 0.35);
        fill.position.set(-8, -3, 6);
        scene.add(fill);

        const rim = new THREE.DirectionalLight(PALETTE.accent, 0.55);
        rim.position.set(-4, 5, -10);
        scene.add(rim);

        scene.add(new THREE.HemisphereLight(0x1b2336, 0x080d18, 0.6));

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
        scene.add(camera);

        this.scene = scene;
        this.camera = camera;
        this.graph = new THREE.Group();
        scene.add(this.graph);
    }

    /* ------------------------------------------------------------------ graph */

    disposeGraph = (): void => {
        if (!this.graph) {
            return;
        }
        this.graph.traverse( (object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                object.material.dispose(); // cached label textures survive; only the material goes
            }
        });
        while (this.graph.children.length) {
            this.graph.remove(this.graph.children[0]);
        }
    }

    rebuildGraph = (): void => {
        this.disposeGraph();

        const layout = this.props.layout;
        if (!layout.nodes.length) {
            return;
        }

        const internalMaterial = new THREE.MeshStandardMaterial({
            color: PALETTE.internal, roughness: 0.55, metalness: 0.18
        });
        const leafMaterial = new THREE.MeshStandardMaterial({
            color: PALETTE.leaf, roughness: 0.4, metalness: 0.1,
            emissive: PALETTE.accent, emissiveIntensity: 0.16
        });
        const internalGeometry = new THREE.SphereBufferGeometry(0.24, 24, 16);
        const leafGeometry = new THREE.SphereBufferGeometry(0.46, 32, 24);

        layout.nodes.forEach( node => {
            const mesh = node.isLeaf
                ? new THREE.Mesh(leafGeometry, leafMaterial)
                : new THREE.Mesh(internalGeometry, internalMaterial);
            mesh.position.set(node.x, node.y, node.z);
            if (node.isLeaf) {
                mesh.scale.set(1, 1, 0.55); // flattened toward the viewer so the label sits on a dome
            }
            this.graph.add(mesh);

            if (node.isLeaf) {
                this.graph.add(this.makeLabel(node));
            }
        });

        layout.edges.forEach( edge => {
            const from = layout.nodes[edge.from];
            const to = layout.nodes[edge.to];
            this.graph.add(this.makeEdge(from, to, edge.bit));
        });
    }

    /** Edges are lit geometry, not flat lines, so a tilted view still reads as depth. */
    makeEdge = (from: LaidOutNode, to: LaidOutNode, bit: string) => {
        const start = new THREE.Vector3(from.x, from.y, from.z);
        const end = new THREE.Vector3(to.x, to.y, to.z);
        const span = new THREE.Vector3().subVectors(end, start);
        const isOne = bit === '1';

        const geometry = new THREE.CylinderBufferGeometry(
            isOne ? 0.045 : 0.035, isOne ? 0.045 : 0.035, span.length(), 8
        );
        const material = new THREE.MeshStandardMaterial({
            color: isOne ? PALETTE.accent : PALETTE.edge,
            roughness: 0.6,
            metalness: 0.1,
            emissive: isOne ? PALETTE.accent : 0x000000,
            emissiveIntensity: isOne ? 0.25 : 0
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(start).add(end).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), span.clone().normalize());

        const label = this.makeBitLabel(bit);
        const sideways = new THREE.Vector3(-span.y, span.x, 0).normalize().multiplyScalar(0.34);
        label.position.copy(start).lerp(end, 0.45).add(sideways).add(new THREE.Vector3(0, 0, 0.3));
        this.graph.add(label);

        return mesh;
    }

    makeLabel = (node: LaidOutNode) => {
        const symbol = displaySymbol(node.name);
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.getLabelTexture(symbol.glyph, PALETTE.label, 700),
            transparent: true,
            depthTest: false
        }));
        sprite.position.set(node.x, node.y, node.z + 0.3);
        sprite.scale.set(0.78, 0.78, 1);
        sprite.renderOrder = 2;
        return sprite;
    }

    makeBitLabel = (bit: string) => {
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
            map: this.getLabelTexture(bit, bit === '1' ? '#4ADE80' : '#B6C2D4', 700),
            transparent: true,
            depthTest: false
        }));
        sprite.scale.set(0.5, 0.5, 1);
        sprite.renderOrder = 3;
        return sprite;
    }

    getLabelTexture = (glyph: string, color: string, weight: number): THREE.Texture => {
        const cacheKey = glyph + '|' + color + '|' + weight;
        if (this.labelCache[cacheKey]) {
            return this.labelCache[cacheKey];
        }

        const size = 128;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, size, size);
        context.font = weight + ' 74px "JetBrains Mono", ui-monospace, monospace';
        context.fillStyle = color;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(glyph, size / 2, size / 2 + 4);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        this.labelCache[cacheKey] = texture;
        return texture;
    }

    /* --------------------------------------------------------------- viewport */

    frameCamera = (): void => {
        const layout = this.props.layout;
        const aspect = this.camera.aspect || 1;
        const halfFov = Math.tan((this.camera.fov * Math.PI) / 360);
        const fitHeight = (layout.height + 1.6) / (2 * halfFov);
        const fitWidth = (layout.width + 1.6) / (2 * aspect * halfFov);

        this.orbit.radius = Math.min(120, Math.max(7, Math.max(fitHeight, fitWidth) * 1.04));
        this.target.set(0, 0, 0);
    }

    resetView = (): void => {
        this.orbit.theta = HOME.theta;
        this.orbit.phi = HOME.phi;
        this.frameCamera();
        this.draw();
    }

    resize = (): void => {
        if (!this.renderer || !this.host) {
            return;
        }
        const width = this.host.clientWidth;
        const height = this.host.clientHeight;
        if (!width || !height) {
            return;
        }
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.frameCamera();
        this.camera.updateProjectionMatrix();
        this.draw();
    }

    draw = (): void => {
        window.cancelAnimationFrame(this.frame);
        this.frame = window.requestAnimationFrame(this.renderFrame);
    }

    /* Rendered on demand rather than in a permanent loop — a static tree costs nothing. */
    renderFrame = (): void => {
        const { theta, phi, radius } = this.orbit;
        this.camera.position.set(
            this.target.x + radius * Math.sin(phi) * Math.sin(theta),
            this.target.y + radius * Math.cos(phi),
            this.target.z + radius * Math.sin(phi) * Math.cos(theta)
        );
        this.camera.lookAt(this.target);
        this.renderer.render(this.scene, this.camera);
    }

    /* --------------------------------------------------------------- controls */

    handlePointerDown = (event: React.MouseEvent<HTMLDivElement>): void => {
        this.dragging = true;
        this.panning = event.button === 2 || event.shiftKey;
        this.lastPointer = { x: event.clientX, y: event.clientY };
    }

    handlePointerMove = (event: React.MouseEvent<HTMLDivElement>): void => {
        if (!this.dragging) {
            return;
        }
        const dx = event.clientX - this.lastPointer.x;
        const dy = event.clientY - this.lastPointer.y;
        this.lastPointer = { x: event.clientX, y: event.clientY };
        this.applyDrag(dx, dy);
    }

    handlePointerUp = (): void => {
        this.dragging = false;
        this.panning = false;
        this.pinchDistance = 0;
    }

    handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
        if (event.touches.length === 2) {
            this.dragging = false;
            this.pinchDistance = this.spanBetween(event.touches);
            return;
        }
        if (event.touches.length !== 1) {
            return;
        }
        this.dragging = true;
        this.panning = false;
        this.pinchDistance = 0;
        this.lastPointer = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    handleTouchMove = (event: React.TouchEvent<HTMLDivElement>): void => {
        // Two fingers pinch to zoom; one finger orbits.
        if (event.touches.length === 2 && this.pinchDistance) {
            const span = this.spanBetween(event.touches);
            if (span > 0) {
                this.zoom(this.pinchDistance / span);
                this.pinchDistance = span;
            }
            return;
        }
        if (!this.dragging || event.touches.length !== 1) {
            return;
        }
        const touch = event.touches[0];
        const dx = touch.clientX - this.lastPointer.x;
        const dy = touch.clientY - this.lastPointer.y;
        this.lastPointer = { x: touch.clientX, y: touch.clientY };
        this.applyDrag(dx, dy);
    }

    spanBetween = (touches: React.TouchList): number => {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    applyDrag = (dx: number, dy: number): void => {
        if (this.panning) {
            const scale = this.orbit.radius * 0.0016;
            this.target.x -= dx * scale;
            this.target.y += dy * scale;
        } else {
            this.orbit.theta -= dx * 0.006;
            this.orbit.phi = Math.min(MAX_PHI, Math.max(MIN_PHI, this.orbit.phi - dy * 0.006));
        }
        this.draw();
    }

    handleWheel = (event: WheelEvent): void => {
        event.preventDefault();
        this.zoom(event.deltaY > 0 ? 1.09 : 1 / 1.09);
    }

    zoom = (factor: number): void => {
        this.orbit.radius = Math.min(120, Math.max(3, this.orbit.radius * factor));
        this.draw();
    }

    /* Orbiting has to work without a pointer, so the canvas takes arrow keys too. */
    handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
        const key = event.key;
        if (key === 'ArrowLeft') {
            this.orbit.theta += KEY_STEP;
        } else if (key === 'ArrowRight') {
            this.orbit.theta -= KEY_STEP;
        } else if (key === 'ArrowUp') {
            this.orbit.phi = Math.max(MIN_PHI, this.orbit.phi - KEY_STEP);
        } else if (key === 'ArrowDown') {
            this.orbit.phi = Math.min(MAX_PHI, this.orbit.phi + KEY_STEP);
        } else if (key === '+' || key === '=') {
            this.zoom(1 / 1.15);
            return;
        } else if (key === '-' || key === '_') {
            this.zoom(1.15);
            return;
        } else if (key === '0') {
            this.resetView();
            return;
        } else {
            return;
        }
        event.preventDefault();
        this.draw();
    }

    setHost = (element: HTMLDivElement): void => {
        this.host = element;
    }

    render() {
        const leaves = this.props.layout.nodes.filter( node => node.isLeaf ).length;

        return (
            <div
                className="scene3d"
                ref={this.setHost}
                onMouseDown={this.handlePointerDown}
                onMouseMove={this.handlePointerMove}
                onMouseUp={this.handlePointerUp}
                onMouseLeave={this.handlePointerUp}
                onTouchStart={this.handleTouchStart}
                onTouchMove={this.handleTouchMove}
                onTouchEnd={this.handlePointerUp}
                onKeyDown={this.handleKeyDown}
                onContextMenu={(event) => event.preventDefault()}
            >
                <p className="visually-hidden">
                    Three-dimensional Huffman tree with {leaves} leaves. Focus this view and use the
                    arrow keys to orbit, plus and minus to zoom, and zero to reset.
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
}

export default TreeScene3D;
