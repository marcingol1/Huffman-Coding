import * as React from 'react';
import Tree from 'react-d3-tree';
import './TreeFlat.css';
import { SerializedNode } from '../utils/coding';
import { displaySymbol } from '../utils/format';

interface Props {
    serialized: SerializedNode[];
}

interface State {
    translate: { x: number; y: number };
    zoom: number;
}

const NODE_STYLES = {
    nodes: {
        node: {
            circle: { fill: '#2A3450', stroke: '#475569', strokeWidth: 1.5 },
            name: { fill: '#F8FAFC', stroke: 'none', fontSize: '12px', fontWeight: 500 },
            attributes: { fill: 'none', stroke: 'none' }
        },
        leafNode: {
            circle: { fill: '#14532D', stroke: '#22C55E', strokeWidth: 1.75 },
            name: { fill: '#F8FAFC', stroke: 'none', fontSize: '12px', fontWeight: 600 },
            attributes: { fill: 'none', stroke: 'none' }
        }
    },
    links: { stroke: '#3D4A68', strokeWidth: 1.5 }
};

const NODE_SIZE = { x: 58, y: 84 };

/*
 * Only the symbol travels with the node. Probability and code already have a
 * column each in the codebook, and repeating them here just collides with the
 * circles.
 */
function toDisplayTree(node: SerializedNode): SerializedNode {
    const isLeaf = !node.children || node.children.length === 0;
    return {
        name: isLeaf ? displaySymbol(node.name).glyph : '',
        attributes: undefined,
        children: isLeaf ? [] : node.children.map(toDisplayTree)
    };
}

function countLeaves(node: SerializedNode): number {
    if (!node.children || !node.children.length) {
        return 1;
    }
    return node.children.reduce( (total, child) => total + countLeaves(child), 0);
}

class TreeFlat extends React.Component<Props, State> {
    state: State = {
        translate: { x: 240, y: 56 },
        zoom: 0.8
    };

    private host: HTMLDivElement;

    componentDidMount() {
        window.addEventListener('resize', this.recentre);
        this.recentre();
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.recentre);
    }

    /** Centre the root and start at a zoom that puts the whole tree on screen. */
    recentre = (): void => {
        if (!this.host) {
            return;
        }
        const width = this.host.clientWidth;
        const height = this.host.clientHeight;
        const source = this.props.serialized[0];
        const leaves = source ? countLeaves(source) : 1;
        // d3 spreads siblings a little wider than the raw node size, so leave headroom.
        const spread = leaves * NODE_SIZE.x * 1.2;
        const zoom = Math.min(1, Math.max(0.2, (width - 64) / spread));

        this.setState({
            translate: { x: width / 2, y: Math.min(64, height * 0.14) },
            zoom
        });
    }

    setHost = (element: HTMLDivElement): void => {
        this.host = element;
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.serialized !== this.props.serialized) {
            this.recentre();
        }
    }

    render() {
        const data = this.props.serialized.map(toDisplayTree);

        return (
            <div className="tree-flat" ref={this.setHost}>
                <Tree
                    data={data}
                    orientation="vertical"
                    translate={this.state.translate}
                    pathFunc="diagonal"
                    collapsible={false}
                    zoomable={true}
                    zoom={this.state.zoom}
                    scaleExtent={{ min: 0.15, max: 3 }}
                    separation={{ siblings: 1, nonSiblings: 1.25 }}
                    nodeSize={NODE_SIZE}
                    transitionDuration={0}
                    styles={NODE_STYLES}
                    circleRadius={15}
                    textLayout={{ textAnchor: 'middle', x: 0, y: 4, transform: undefined }}
                />
                <p className="tree-flat__hint" aria-hidden={true}>
                    Drag to pan · Scroll to zoom
                </p>
            </div>
        );
    }
}

export default TreeFlat;
