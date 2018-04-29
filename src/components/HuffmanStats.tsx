import * as React from 'react';
import HuffmanCoding from '../utils/coding';

interface Props {
    huffmanCode: HuffmanCoding;
}

class HuffmanStats extends React.Component<Props> {

    codes = [
        {sign: 's'},
        {sign: 'a'},
        {sign: 'b'},
    ];

    getSingleCodeComponent = (code) => (
        <p key={code.sign + '-key-sign'}>
            <span>{code.sign}</span><span>{5}</span>
        </p>
    )

    render() {
        return (
            <div>
                <section>
                    <h4>Entropy of code:</h4>
                    <p>{this.props.huffmanCode.countGraphEntropy()}</p>
                </section>
                <section>
                    <h4>Average length of sign coding:</h4>
                    <p>{2}</p>
                </section>
                <section>
                    <h4>Sign codes: </h4>
                    {this.codes.map(this.getSingleCodeComponent)}
                </section>
            </div>
        );
    }
}

export default HuffmanStats;