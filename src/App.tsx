import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';
import HuffmanTree from './components/HuffmanTree';

class App extends React.Component {
  render() {
    const huffmanCode = new HuffmanCoding();
    return (
      <div className="App">
        <HuffmanTree huffmanCode={huffmanCode} />
      </div>
    );
  }
}

export default App;
