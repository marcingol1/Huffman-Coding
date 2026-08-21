import * as React from 'react';
import './App.css';
import HuffmanCoding from './utils/coding';
import generateRandomSigns from './utils/generateRandomSigns';
import Composer from './components/Composer';
import Metrics from './components/Metrics';
import Codebook from './components/Codebook';
import TreePanel from './components/TreePanel';
import EncodedOutput from './components/EncodedOutput';

const MAX_LENGTH = 500;
const FIXED_WIDTH_BITS = 8;

const DEFAULT_TEXT = 'huffman coding turns frequent symbols into short codes';

interface State {
    text: string;
}

class App extends React.Component<{}, State> {
    state: State = {
        text: DEFAULT_TEXT
    };

    setText = (text: string): void => {
        this.setState({ text: text.slice(0, MAX_LENGTH) });
    }

    render() {
        const text = this.state.text;
        // Derived during render — there is no second copy of this to keep in sync.
        const coding = new HuffmanCoding(generateRandomSigns(text));
        const encoded = coding.encode(text);
        const originalBits = text.length * FIXED_WIDTH_BITS;
        const encodedBits = encoded.length;

        return (
            <div className="app">
                <header className="app__header">
                    <div className="app__header-inner">
                        <h1 className="app__wordmark">
                            Huffman<span className="app__wordmark-dot">.</span>
                        </h1>
                        <p className="app__tagline">
                            Build the tree, read the codebook, watch the bitstream shrink.
                        </p>
                    </div>
                </header>

                <main className="app__main" id="main">
                    <Composer
                        text={text}
                        maxLength={MAX_LENGTH}
                        onChange={this.setText}
                    />

                    <Metrics
                        symbolCount={coding.nodeCodes.length}
                        originalBits={originalBits}
                        encodedBits={encodedBits}
                        averageLength={coding.codingLength}
                        entropy={coding.countGraphEntropy()}
                    />

                    <div className="app__grid">
                        <TreePanel coding={coding}/>
                        <div className="app__column">
                            <Codebook nodeCodes={coding.nodeCodes} totalSigns={text.length}/>
                            <EncodedOutput
                                encoded={encoded}
                                originalBits={originalBits}
                            />
                        </div>
                    </div>
                </main>

                <footer className="app__footer">
                    <p>
                        Codes are assigned by walking the tree: <code className="app__bit">0</code> takes
                        the left branch, <code className="app__bit">1</code> takes the right.
                        Comparison baseline is {FIXED_WIDTH_BITS} bits per character.
                    </p>
                </footer>
            </div>
        );
    }
}

export default App;
