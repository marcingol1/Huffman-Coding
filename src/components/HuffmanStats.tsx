import * as React from 'react';

interface NodeCode {
    sign: string;
    code: string;
}

interface Props {
    huffmanStats: NodeCode[]; // @TODO: extract interface to other file
    entropy: number;
}

class HuffmanStats extends React.Component<Props> {
    getSingleCodeComponent = (code) => (
        <p key={code.sign + '-key-sign'}>
            <span>`{code.sign}`: </span><span>{code.code}</span>
        </p>
    )

    render() {
        return (
            <div>
                <section>
                    <h4>Entropy of code:</h4>
                    <p>{this.props.entropy}</p>
                </section>
                <section>
                    <h4>Average length of sign coding:</h4>
                    <p>{2}</p>
                </section>
                <section>
                    <h4>Sign codes: </h4>
                    {this.props.huffmanStats.map(this.getSingleCodeComponent)}
                </section>
            </div>
        );
    }
}

export default HuffmanStats;