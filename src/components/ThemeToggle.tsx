'use client';

import { useSyncExternalStore } from 'react';
import {
    applyTheme,
    getServerThemeChoice,
    getThemeChoice,
    subscribeThemeChoice,
    type ThemeChoice
} from '../utils/theme';
import './ThemeToggle.css';

const OPTIONS: { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: 'Auto' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' }
];

export default function ThemeToggle() {
    // Read from the store rather than synced into state: the server renders
    // `system`, and the client swaps to the stored choice on hydration. The
    // inline script in the layout has already applied it to the document.
    const choice = useSyncExternalStore(
        subscribeThemeChoice, getThemeChoice, getServerThemeChoice
    );

    return (
        <div className="segmented theme-toggle" role="group" aria-label="Colour theme">
            {OPTIONS.map( option => (
                <button
                    key={option.value}
                    type="button"
                    className={'segmented__btn' + (choice === option.value ? ' is-active' : '')}
                    onClick={() => applyTheme(option.value)}
                    aria-pressed={choice === option.value}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
