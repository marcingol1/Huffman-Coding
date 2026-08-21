import type { SerializedNode } from './coding';

interface LaidOutNode {
    id: number;
    name: string;
    code: string;
    p: number;
    depth: number;
    isLeaf: boolean;
    x: number;
    y: number;
    z: number;
}

interface LaidOutEdge {
    from: number;
    to: number;
    bit: string;
}

interface TreeLayout {
    nodes: LaidOutNode[];
    edges: LaidOutEdge[];
    maxDepth: number;
    width: number;
    height: number;
    /** Changes only when the drawn tree changes, so the scene is not rebuilt per keystroke. */
    signature: string;
}

const LEAF_GAP = 1.5;
const LEVEL_GAP = 1.5;
/** Frequent symbols sit slightly closer to the viewer — depth carries data, not decoration. */
const DEPTH_RELIEF = 0.9;

/**
 * Tidy layout: leaves take consecutive slots left to right, every parent centres
 * over its children, and depth grows downward.
 */
function layoutTree(serialized: SerializedNode[]): TreeLayout {
    const nodes: LaidOutNode[] = [];
    const edges: LaidOutEdge[] = [];

    if (!serialized || !serialized.length) {
        return { nodes, edges, maxDepth: 0, width: 0, height: 0, signature: 'empty' };
    }

    let nextLeafSlot = 0;
    let maxDepth = 0;

    function walk(source: SerializedNode, depth: number, bitFromParent: string, parentId: number): number {
        const id = nodes.length;
        const isLeaf = !source.children || source.children.length === 0;
        const p = parseFloat(source.attributes.p) || 0;

        const node: LaidOutNode = {
            id,
            name: source.name,
            code: source.attributes.code,
            p,
            depth,
            isLeaf,
            x: 0,
            y: -depth * LEVEL_GAP,
            z: isLeaf ? p * DEPTH_RELIEF : 0
        };
        nodes.push(node);

        if (parentId >= 0) {
            edges.push({ from: parentId, to: id, bit: bitFromParent });
        }
        if (depth > maxDepth) {
            maxDepth = depth;
        }

        if (isLeaf) {
            node.x = nextLeafSlot * LEAF_GAP;
            nextLeafSlot += 1;
        } else {
            const childIds = source.children.map( (child, index) =>
                walk(child, depth + 1, index === 0 ? '0' : '1', id));
            const first = nodes[childIds[0]].x;
            const last = nodes[childIds[childIds.length - 1]].x;
            node.x = (first + last) / 2;
        }

        return id;
    }

    walk(serialized[0], 0, '', -1);

    // Centre the whole tree on the origin so the camera framing stays symmetric.
    const xs = nodes.map( node => node.x );
    const minX = Math.min.apply(null, xs);
    const maxX = Math.max.apply(null, xs);
    const midX = (minX + maxX) / 2;
    const midY = -(maxDepth * LEVEL_GAP) / 2;

    nodes.forEach( node => {
        node.x -= midX;
        node.y -= midY;
    });

    const signature = nodes
        .map( node => node.name + ':' + node.code + ':' + node.p.toFixed(3) )
        .join('|');

    return {
        nodes,
        edges,
        maxDepth,
        width: Math.max(maxX - minX, LEAF_GAP),
        height: Math.max(maxDepth * LEVEL_GAP, LEVEL_GAP),
        signature
    };
}

export type { LaidOutNode, LaidOutEdge, TreeLayout };
export default layoutTree;
