/**
 * The shape every non-tree coder reports in. Huffman and Shannon–Fano earn the
 * tree view; everything else emits a run of tokens and keeps a table beside it,
 * so one pair of components serves all of them.
 */
export interface StreamItem {
    /** The span of source this token covers, rendered as code. */
    label: string;
    /** What the coder actually wrote for it. */
    code: string;
    bits: number;
    /** Anything the token changed about the coder's state. */
    note?: string;
}

export interface DetailTable {
    title: string;
    /** Column headings; every row must have one cell per heading. */
    columns: string[];
    rows: string[][];
    /** Column indexes to render right-aligned and tabular. */
    numeric?: number[];
    /** Column indexes to render in the mono face. */
    mono?: number[];
    meta?: string;
    note?: string;
}

export interface StreamCoding {
    bits: string;
    streamTitle: string;
    streamMeta: string;
    streamNote: string;
    stream: StreamItem[];
    detail: DetailTable;
}
