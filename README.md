# Huffman Coding

Type any text and watch the Huffman tree, the codebook and the encoded bitstream
rebuild as you go, with the compression against a fixed 8-bit encoding measured
alongside them.

Live demo: https://huffman-coding-dizlu.netlify.com/

Built with Next.js (App Router), React 19 and TypeScript. The page is fully
static — no server work happens per request — so it deploys to Vercel as-is with
no configuration.

## Running it

```bash
npm install
npm run dev    # dev server on :3000
npm test       # jest
npm run lint   # eslint
npm run build  # production build
```

## The interface

The page is a single workspace rather than a form plus a canvas:

- **Source text** — a labelled textarea with samples, a character counter and a
  clear action. Everything downstream recomputes on each keystroke.
- **Results strip** — space saved, fixed-width size, Huffman size, distinct
  symbols, average code length and entropy, in one instrument panel.
- **Huffman tree** — a lit Three.js scene you can orbit, pan and zoom (arrow
  keys and `+` / `-` work too), with a flat SVG view beside it for scanning.
  If WebGL is unavailable the flat view takes over on its own.
- **Codebook** — every symbol with its count, share, code and code length.
  Whitespace is shown as `␣`, `⏎` and `⇥` so those rows are readable.
- **Encoded bitstream** — the output in byte-sized groups, with a copy action.

Design tokens, the palette and the typography live in `src/app/globals.css` and
are recorded in `design-system/huffman-coding/MASTER.md`. The page is dark-only,
uses one accent, and every piece of text clears WCAG AA contrast on its own
surface. The App Router allows global stylesheets only from the root layout, so
`src/app/layout.tsx` registers every component sheet.

Both tree views are drawn from the same tidy layout in `src/utils/layoutTree.ts`
— the depth view feeds it to Three.js, the flat view to hand-written SVG — so
switching between them never moves a node.

## The algorithm

`src/utils/coding.ts` builds the tree the textbook way: repeatedly merge the two
least probable nodes still in the queue — internal nodes included — until one
root remains. Codes come from the walk down, `0` left and `1` right.

Edge cases are handled rather than thrown: empty input produces an empty
codebook, and a single distinct symbol falls back to one bit per symbol. Both are
covered in `src/utils/coding.test.ts`, along with a check that the codebook stays
prefix-free and never averages fewer bits per symbol than the entropy.
