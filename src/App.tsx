import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';
import HuffmanTree from './components/HuffmanTree';
import generateRandomSigns from './utils/generateRandomSigns';
import HuffmanStats from './components/HuffmanStats';

class App extends React.Component {
    textTemp = '';
    state = {
        text: 'test value'
    };

    setText = (text) => {
        this.setState(state => ({...this.state, text}));
    }

    setTempText = (event) => {
        this.textTemp = event.target.value;
    }

    render() {
        const huffmanCode = new HuffmanCoding(generateRandomSigns(this.state.text));
        return (
            <div className="App">
                <div style={{display: 'flex', height: '40px', padding: '10px', justifyContent: 'space-around'}}>
                    <p>Enter your code: </p>
                    <input onChange={this.setTempText}/>
                    <button onClick={() => this.textTemp ? this.setText(this.textTemp) : null}> Generate tree!</button>
                </div>
                <div style={{display: 'flex'}}>
                    <HuffmanTree huffmanCode={huffmanCode}/>
                    <HuffmanStats
                        huffmanStats={huffmanCode.nodeCodes}
                        entropy={huffmanCode.countGraphEntropy()}
                        averageLength={huffmanCode.codingLength}
                        text={this.state.text}
                        huffmanCode={huffmanCode}
                    />
                </div>
            </div>
        );
    }
}

export default App;
