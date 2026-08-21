'use client';

import { useSyncExternalStore } from 'react';

const TOKENS = [
    'scene-bg', 'scene-node', 'scene-edge',
    'leaf-fill', 'leaf-ink', 'accent', 'bit-one-ink', 'fg-muted'
] as const;

export type ScenePalette = Record<(typeof TOKENS)[number], string>;

function readPalette(): ScenePalette {
    const styles = getComputedStyle(document.documentElement);
    const palette = {} as ScenePalette;
    TOKENS.forEach( token => {
        palette[token] = styles.getPropertyValue('--' + token).trim();
    });
    return palette;
}

/*
 * The snapshot has to be referentially stable or useSyncExternalStore will loop,
 * so the resolved palette is cached and only recomputed when something tells us
 * the theme moved.
 */
let cached: ScenePalette | null = null;

function getSnapshot(): ScenePalette | null {
    if (!cached) {
        cached = readPalette();
    }
    return cached;
}

/** No DOM on the server, so the scene simply does not draw until hydration. */
function getServerSnapshot(): ScenePalette | null {
    return null;
}

function subscribe(onChange: () => void): () => void {
    const refresh = () => {
        cached = readPalette();
        onChange();
    };

    // data-theme covers the toggle; the media query covers the OS moving
    // underneath a viewer who left the choice on `system`.
    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', refresh);

    return () => {
        observer.disconnect();
        media.removeEventListener('change', refresh);
    };
}

/**
 * WebGL cannot read a CSS variable, so the scene has to be handed real colours
 * and rebuilt when they change.
 */
export default function useScenePalette(): ScenePalette | null {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
