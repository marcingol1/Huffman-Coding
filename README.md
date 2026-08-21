# Huffman Coding

Type any text and watch the Huffman tree, the codebook and the encoded bitstream
rebuild as you go, with the compression against a fixed 8-bit encoding measured
alongside them.

Live demo: https://huffman-coding-dizlu.netlify.com/

## Running it

```bash
npm install
npm start      # dev server on :3000
npm test       # jest
npm run build  # production bundle into build/
```

The scripts set `NODE_OPTIONS=--openssl-legacy-provider` because `react-scripts-ts`
2.14 predates Node 17's OpenSSL 3 default and its bundler cannot hash otherwise.

## The interface

The page is a single workspace rather than a form plus a canvas:

- **Source text** — a labelled textarea with samples, a character counter and a
  clear action. Everything downstream recomputes on each keystroke.
- **Results strip** — space saved, fixed-width size, Huffman size, distinct
  symbols, average code length and entropy, in one instrument panel.
- **Huffman tree** — a lit Three.js scene you can orbit, pan and zoom (arrow
  keys, `+` / `-` and `0` work too), with a flat 2D view beside it for scanning.
  If WebGL is unavailable the flat view takes over on its own.
- **Codebook** — every symbol with its count, share, code and code length.
  Whitespace is shown as `␣`, `⏎` and `⇥` so those rows are readable.
- **Encoded bitstream** — the output in byte-sized groups, with a copy action.

Design tokens, the palette and the typography live in `src/index.css` and are
recorded in `design-system/huffman-coding/MASTER.md`. The page is dark-only, uses
one accent, and every piece of text clears WCAG AA contrast on its own surface.

## The algorithm

`src/utils/coding.ts` builds the tree the textbook way: repeatedly merge the two
least probable nodes still in the queue — internal nodes included — until one
root remains. Codes come from the walk down, `0` left and `1` right.

Edge cases are handled rather than thrown: empty input produces an empty
codebook, and a single distinct symbol falls back to one bit per symbol. Both are
covered in `src/utils/coding.test.ts`, along with a check that the codebook stays
prefix-free and never averages fewer bits per symbol than the entropy.
