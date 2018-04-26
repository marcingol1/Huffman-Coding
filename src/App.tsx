import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';
import HuffmanTree from './components/HuffmanTree';
import generateRandomSigns from './utils/generateRandomSigns';

class App extends React.Component {
    textTemp = '';
    state = {
        text: 'test value for lolz'
    };

    setText = (text) => {
        this.setState(state => ({...this.state, text}));
    }

    setTextTemp = (event) => {
        this.textTemp = event.target.value;
    }

    render() {
        const huffmanCode = new HuffmanCoding(generateRandomSigns(this.state.text));
        return (
            <div className="App">
                <div style={{display: 'flex', height: '40px', padding: '10px', justifyContent: 'space-around'}}>
                    <p>Enter your code: </p>
                    <input onChange={this.setTextTemp}/>
                    <button onClick={() => this.setText(this.textTemp)}> Generate tree!</button>
                </div>
                <HuffmanTree huffmanCode={huffmanCode}/>
            </div>
        );
    }
}

export default App;
