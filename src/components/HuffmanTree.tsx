import * as React from 'react';
import HuffmanCoding from '../utils/coding';
import Tree from 'react-d3-tree';
import './HuffmanTree.css';

interface Props {
    huffmanCode: HuffmanCoding;
}

class HuffmanTree extends React.Component<Props> {

    initialTree = [
        {
            name: 'Top Level',
            attributes: {
                keyA: 'val A',
            },
            children: [
                {
                    name: 'Level 2: A',
                    attributes: {
                        keyA: 'val A',
                    },
                },
                {
                    name: 'Level 2: B',
                },
            ],
        },
    ];

    render() {
        return (
            <div id="treeWrapper">
                <h3>Admire this random tree!</h3>
                <Tree
                    translate={{x: 300, y: 100}}
                    data={this.props.huffmanCode.serializeGraph()}
                    orientation="vertical"
                    depthFactor={30}
                />
            </div>
        );
    }
}

export default HuffmanTree;