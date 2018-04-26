import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';
import HuffmanTree from './components/HuffmanTree';

class App extends React.Component {
    huffmanCode = new HuffmanCoding();
    render() {
    return (
      <div className="App">
        <HuffmanTree huffmanCode={this.huffmanCode} />
      </div>
    );
  }
}

export default App;
