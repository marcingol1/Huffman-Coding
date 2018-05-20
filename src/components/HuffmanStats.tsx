import * as React from 'react';
import HuffmanCoding from '../utils/coding';

interface NodeCode {
    sign: string;
    code: string;
}

interface Props {
    huffmanStats: NodeCode[]; // @TODO: extract interface to other file
    entropy: number;
    averageLength: number;
    text: string;
    huffmanCode: HuffmanCoding;
}

class HuffmanStats extends React.Component<Props> {
    getSingleCodeComponent = (code) => (
        <p key={code.sign + '-key-sign'}>
            <span>`{code.sign}`: </span><span>{code.code}</span>
        </p>
    )

    mapTextToNodeCodes = (nodeCodes, text) => {
        const textSplit = text.split('');
        return textSplit.map( textCode => {
            return nodeCodes.find( code => textCode === code.sign).code;
        });
    }

    render() {
        const huffmanCode = this.props.huffmanCode;
        return (
            <div>
                <section>
                    <h4>Entropy of code:</h4>
                    <p>{this.props.entropy}</p>
                </section>
                <section>
                    <h4>Average length of sign coding:</h4>
                    <p>{this.props.averageLength}</p>
                </section>
                <section>
                    <h4>Sign codes: </h4>
                    {this.props.huffmanStats.map(this.getSingleCodeComponent)}
                </section>
                <section style={{overflow: 'scroll'}}>
                    <h4>Final coded message: </h4>
                    <p style={{maxWidth: '200px', overflow: 'scroll', padding: '15px'}}>
                        {this.mapTextToNodeCodes(huffmanCode.nodeCodes, this.props.text)}
                    </p>
                </section>
            </div>
        );
    }
}

export default HuffmanStats;