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

Six coders, switchable in the page, from four different principles. Every one of
them wins on some input, which is the point: compression is a question about the
data, not a league table.

| Coder | Principle | Wins when |
|---|---|---|
| **Huffman** | per-symbol prefix code, built upward by merging the two least probable nodes | almost always, on short or low-repetition text |
| **Shannon–Fano** | per-symbol prefix code, built downward by splitting at the most even point | never — it ties Huffman or loses, which is the lesson |
| **Arithmetic** | one number for the whole message; each symbol narrows an interval | long prose, where Huffman's rounding to whole bits accumulates |
| **LZW** | codes repeated phrases, learning a longer one each time | repetitive text, once phrases get long enough to pay |
| **LZ77** | points backwards into text already sent, no dictionary kept | heavy repetition within its 255-character window |
| **RLE** | counts repeats and ignores frequency entirely | actual runs — and only those |

Only the two tree coders share machinery. They differ in `src/utils/trees.ts`
alone, and keep the tree view and the codebook. The other four emit a stream of
tokens and a table beside it, so one pair of components serves all of them.

Some figures the samples produce, in bits:

```
              fixed  Huffman  Arith   LZW   LZ77    RLE
Buffalo         512      189    189   154    142    896
Runs            512       98     99    73     88     48
Macbeth        1480      769    760   931   1240   2832
```

The `Coder gap` sample is the smallest input where Huffman and Shannon–Fano
disagree: counts 5,2,2,2,2 cost 29 bits against 30.

### Two things the comparison exposes

**LZW's dictionary is seeded with the symbols the text actually uses**, not all
256 bytes. A full byte table would spend nine bits on the first code of a
four-letter alphabet, and the comparison would measure the seeding rather than
the algorithm — 440 bits instead of 285 on the `Sentence` sample.

**The entropy tile changes wording with the coder.** Shannon's order-0 bound
only constrains coders that spend a codeword per symbol, so Huffman,
Shannon–Fano and arithmetic can never average below it. LZW, LZ77 and RLE model
sequences and runs, and go under it freely — RLE averages 0.75 bits per
character on `Runs` against an entropy of 1.516.

Edge cases are handled rather than thrown: empty input produces an empty
codebook, and a single distinct symbol falls back to one bit per symbol.

`src/utils/coding.test.ts` covers the tree coders — prefix-freeness, the entropy
bound, and Shannon–Fano never beating Huffman. `src/utils/coders.test.ts` covers
the other four against reference implementations, including each one's winning
case and its losing case.
