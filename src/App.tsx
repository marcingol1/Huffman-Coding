import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';

class App extends React.Component {
  render() {
    const coding = new HuffmanCoding();
    console.log(coding);
    return (
      <div className="App">
          Hello world!
      </div>
    );
  }
}

export default App;
