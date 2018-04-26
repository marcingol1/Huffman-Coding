import * as React from 'react';
import HuffmanCoding from '../utils/coding';
import Tree from 'react-d3-tree';
import './HuffmanTree.css';

interface Props {
    huffmanCode: HuffmanCoding;
}

class HuffmanTree extends React.Component<Props> {
    render() {
        return (
            <div id="treeWrapper">
                <h3>Admire this random deployed tree!</h3>
                <Tree
                    translate={{x: 600, y: 100}}
                    data={this.props.huffmanCode.serializeGraph()}
                    orientation="vertical"
                    depthFactor={30}
                />
            </div>
        );
    }
}

export default HuffmanTree;