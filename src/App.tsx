import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';

class App extends React.Component {
  render() {
    const a = new HuffmanCoding();
    console.log(a);
    return (
      <div className="App">
          Hello world!
      </div>
    );
  }
}

export default App;
