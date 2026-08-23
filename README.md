# Huffman Coding

Type any text and watch the Huffman tree, the codebook and the encoded bitstream
rebuild as you go, with the compression against a fixed 8-bit encoding measured
alongside them.

Built with Next.js (App Router), React 19 and TypeScript.

## Running it

```bash
npm install
npm run dev    # dev server on :3000
npm test       # jest
npm run lint   # eslint
npm run build  # production build
```

## Deploying

The page is fully static — nothing runs per request — so Vercel needs no
configuration at all. There is no `vercel.json`, and none should be added.

Importing the repo is enough: Vercel finds `next` in `package.json` and picks
the Next.js preset itself, which fills in the build command, the output
directory and the install step. Leave all three on their detected values.

- **Production** is whatever Vercel has set as the Production Branch, which
  defaults to this repo's default branch. Merging there is the deploy; there is
  no separate production branch to promote into.
- **Every other branch and pull request** gets its own preview deployment
  automatically.
- **Node version** is Vercel's default. Nothing here pins it, and nothing needs
  to — the OpenSSL workaround the old create-react-app build depended on is gone
  along with that toolchain.

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
- **Theme** — auto, light or dark, in the header. Auto follows the operating
  system and keeps following it; an explicit choice is stored per browser and
  applied by an inline script before the first paint, so reloading never flashes
  the other theme.

Design tokens, the palette and the typography live in `src/app/globals.css` and
are recorded in `design-system/huffman-coding/MASTER.md`. The App Router allows
global stylesheets only from the root layout, so `src/app/layout.tsx` registers
every component sheet.

Light is defined on bare `:root`; dark overrides only the colour tokens, once
for the system preference and once for an explicit choice. One hue does all the
accent work — `--accent` fills, `--accent-ink` writes — and **every text token
clears 4.5:1 against every surface token in both themes**, which is checked
rather than assumed. Because WebGL cannot read a CSS variable, the depth view
reads the resolved `--scene-*` tokens through `useScenePalette` and rebuilds
when they change.

Both tree views are drawn from the same tidy layout in `src/utils/layoutTree.ts`
— the depth view feeds it to Three.js, the flat view to hand-written SVG — so
switching between them never moves a node.

## The algorithms

Three coders, switchable in the page. Two of them build a tree and share all
the same machinery; the third works on a different principle entirely.

- **Huffman** builds upward: repeatedly merge the two least probable nodes still
  in the queue, internal nodes included, until one root remains. Optimal — no
  prefix code has a shorter weighted average.
- **Shannon–Fano** builds downward: sort by probability, cut the list where the
  two halves are closest in weight, give one side `0` and the other `1`, recurse.
  Splitting top-down cannot see what a split costs further down, so it ties
  Huffman or loses to it, never wins.

Codes come from the walk down, `0` left and `1` right. The `Coder gap` sample is
the smallest input where the two disagree: counts 5,2,2,2,2 cost 29 bits under
Huffman and 30 under Shannon–Fano.

- **LZW** codes repeated *phrases* rather than single symbols. Each phrase it
  emits teaches the dictionary that phrase plus one more symbol, and codes are
  written at whatever width the dictionary currently needs. It replaces the tree
  view with a phrase stream and the codebook with a dictionary.

The dictionary is seeded with the symbols the text actually uses, not all 256
bytes — a full byte table would spend nine bits on the first code of a
four-letter alphabet, which says more about the seeding than the algorithm.

LZW is the reason the entropy tile changes wording with the coder. Shannon's
order-0 bound only constrains codes that spend a fixed codeword per symbol, so
Huffman and Shannon–Fano can never average below it. LZW models sequences, and
on the `Buffalo` sample it averages 2.406 bits per character against an entropy
of 2.937 — below a floor that was never its floor. It loses badly on text with
little repetition: on `Sentence` it needs 285 bits where Huffman needs 221.

Edge cases are handled rather than thrown: empty input produces an empty
codebook, and a single distinct symbol falls back to one bit per symbol. Both are
covered in `src/utils/coding.test.ts` for both coders, along with checks that
each codebook stays prefix-free, that neither averages fewer bits per symbol than
the entropy, and that Shannon–Fano is never shorter than Huffman.
