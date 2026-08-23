'use client';

import { useMemo, useState } from 'react';
import SymbolCoding from '../utils/coding';
import generateRandomSigns from '../utils/generateRandomSigns';
import Composer from './Composer';
import CoderSwitch from './CoderSwitch';
import Metrics from './Metrics';
import Codebook from './Codebook';
import TreePanel from './TreePanel';
import EncodedOutput from './EncodedOutput';
import { CODERS, type Coder } from '../utils/trees';
import ThemeToggle from './ThemeToggle';

const MAX_LENGTH = 500;
const FIXED_WIDTH_BITS = 8;
const DEFAULT_TEXT = 'huffman coding turns frequent symbols into short codes';

export default function Workspace() {
    const [text, setText] = useState(DEFAULT_TEXT);
    const [coder, setCoder] = useState<Coder>('huffman');

    // Derived, not stored — there is no second copy of this to keep in sync.
    const coding = useMemo(
        () => new SymbolCoding(generateRandomSigns(text), coder),
        [text, coder]
    );
    const encoded = useMemo(() => coding.encode(text), [coding, text]);

    const originalBits = text.length * FIXED_WIDTH_BITS;

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
                    <ThemeToggle/>
                </div>
            </header>

            <main className="app__main" id="main">
                <Composer
                    text={text}
                    maxLength={MAX_LENGTH}
                    onChange={ value => setText(value.slice(0, MAX_LENGTH)) }
                />

                <CoderSwitch coder={coder} onChange={setCoder}/>

                <Metrics
                    coderLabel={CODERS[coder].label}
                    symbolCount={coding.nodeCodes.length}
                    originalBits={originalBits}
                    encodedBits={encoded.length}
                    averageLength={coding.codingLength}
                    entropy={coding.countGraphEntropy()}
                />

                <div className="app__grid">
                    <TreePanel coding={coding}/>
                    <div className="app__column">
                        <Codebook nodeCodes={coding.nodeCodes} totalSigns={text.length}/>
                        <EncodedOutput encoded={encoded} originalBits={originalBits}/>
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
