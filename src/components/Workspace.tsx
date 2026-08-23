'use client';

import { useMemo, useState } from 'react';
import encodeText from '../utils/encoding';
import Composer from './Composer';
import CoderSwitch from './CoderSwitch';
import Metrics from './Metrics';
import Codebook from './Codebook';
import DetailTable from './DetailTable';
import Stream from './Stream';
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
    const encoding = useMemo(() => encodeText(text, coder), [text, coder]);

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
                    buildsTree={CODERS[coder].buildsTree}
                    perSymbol={CODERS[coder].perSymbol}
                    symbolCount={encoding.symbolCount}
                    originalBits={originalBits}
                    encodedBits={encoding.encoded.length}
                    averageLength={encoding.averageLength}
                    entropy={encoding.entropy}
                />

                <div className="app__grid">
                    {encoding.tree ? (
                        <TreePanel coding={encoding.tree}/>
                    ) : (
                        <Stream coding={encoding.stream!}/>
                    )}
                    <div className="app__column">
                        {encoding.tree ? (
                            <Codebook nodeCodes={encoding.tree.nodeCodes} totalSigns={text.length}/>
                        ) : (
                            <DetailTable detail={encoding.stream!.detail}/>
                        )}
                        <EncodedOutput
                            encoded={encoding.encoded}
                            originalBits={originalBits}
                        />
                    </div>
                </div>
            </main>

            <footer className="app__footer">
                <p>
                    {CODERS[coder].buildsTree ? (
                        <>
                            Codes are assigned by walking the tree:{' '}
                            <code className="app__bit">0</code> takes the left branch,{' '}
                            <code className="app__bit">1</code> takes the right.{' '}
                        </>
                    ) : (
                        <>{CODERS[coder].footer}{' '}</>
                    )}
                    Comparison baseline is {FIXED_WIDTH_BITS} bits per character.
                </p>
            </footer>
        </div>
    );
}
