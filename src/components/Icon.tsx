import * as React from 'react';

/*
 * One authored icon set: 24x24 box, 1.5 stroke, round caps and joins.
 * No emoji, no glyph substitutes, no second family mixed in.
 */

interface Props {
    name: string;
    size?: number;
    className?: string;
}

const PATHS = {
    tree: 'M12 3v5m0 0L6.5 12m5.5-4l5.5 4M6.5 12v3m11-3v3M12 3.8a1.8 1.8 0 100-.1zM6.5 16.4a1.8 1.8 0 100-.1z'
        + 'M17.5 16.4a1.8 1.8 0 100-.1z',
    grid: 'M4 6h16M4 12h16M4 18h16M9.5 4v16M15 4v16',
    copy: 'M9 9V6.5A1.5 1.5 0 0110.5 5h7A1.5 1.5 0 0119 6.5v7a1.5 1.5 0 01-1.5 1.5H15'
        + 'M5 10.5A1.5 1.5 0 016.5 9h7A1.5 1.5 0 0115 10.5v7a1.5 1.5 0 01-1.5 1.5h-7A1.5 1.5 0 015 17.5z',
    check: 'M4.5 12.5l5 5 10-11',
    reset: 'M4.5 9.5a8 8 0 1113.6 6.9M4.5 4.5v5h5',
    alert: 'M12 8.5v4.5m0 3.2v.1M4.6 18.5h14.8a1.6 1.6 0 001.4-2.4l-7.4-12.6a1.6 1.6 0 00-2.8 0'
        + 'L3.2 16.1a1.6 1.6 0 001.4 2.4z',
    caret: 'M8 5l8 7-8 7'
};

class Icon extends React.Component<Props> {
    render() {
        const size = this.props.size || 18;
        return (
            <svg
                className={this.props.className}
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden={true}
                focusable="false"
            >
                <path d={PATHS[this.props.name]}/>
            </svg>
        );
    }
}

export default Icon;
