export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'huffman-theme';

const THEME_COLORS: Record<ResolvedTheme, string> = {
    light: '#F1F5F9',
    dark: '#0F172A'
};

export function isThemeChoice(value: unknown): value is ThemeChoice {
    return value === 'system' || value === 'light' || value === 'dark';
}

export function readStoredChoice(): ThemeChoice {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeChoice(stored) ? stored : 'system';
    } catch {
        // Private windows and blocked site data both throw; system is the safe answer.
        return 'system';
    }
}

export function systemTheme(): ResolvedTheme {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(choice: ThemeChoice): ResolvedTheme {
    return choice === 'system' ? systemTheme() : choice;
}

/**
 * `system` clears the attribute rather than writing a value, so the media query
 * in globals.css stays in charge and keeps following the OS while it is chosen.
 */
export function applyTheme(choice: ThemeChoice): void {
    const root = document.documentElement;

    if (choice === 'system') {
        root.removeAttribute('data-theme');
    } else {
        root.setAttribute('data-theme', choice);
    }

    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', THEME_COLORS[resolveTheme(choice)]);

    try {
        if (choice === 'system') {
            window.localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
            window.localStorage.setItem(THEME_STORAGE_KEY, choice);
        }
    } catch {
        // A viewer who cannot persist still gets the theme for this page view.
    }

    listeners.forEach( listener => listener() );
}

/* --------------------------------------------------------------- store ---
 * The chosen theme lives in localStorage and on the root element, both of
 * which are outside React. Exposed as a subscribable store so components can
 * read it with useSyncExternalStore instead of syncing it in an effect.
 */

const listeners = new Set<() => void>();

export function subscribeThemeChoice(onChange: () => void): () => void {
    listeners.add(onChange);
    // Another tab writing the same key should move this one too.
    window.addEventListener('storage', onChange);
    return () => {
        listeners.delete(onChange);
        window.removeEventListener('storage', onChange);
    };
}

export function getThemeChoice(): ThemeChoice {
    return readStoredChoice();
}

/** The server cannot know the choice; `system` is what the markup assumes. */
export function getServerThemeChoice(): ThemeChoice {
    return 'system';
}

/**
 * Runs before first paint so a stored choice never flashes the other theme.
 * Kept as a string because it has to be inlined into the document, not bundled.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var c=localStorage.getItem(${
    JSON.stringify(THEME_STORAGE_KEY)
});if(c==='light'||c==='dark'){document.documentElement.setAttribute('data-theme',c);}}catch(e){}})();`;
