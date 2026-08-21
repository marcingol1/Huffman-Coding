import type { Metadata, Viewport } from 'next';

// Self-hosted so the first paint never waits on a font host. App Router allows
// global stylesheets only here, so every component sheet is registered too.
import '@fontsource/ibm-plex-sans/latin-400.css';
import '@fontsource/ibm-plex-sans/latin-500.css';
import '@fontsource/ibm-plex-sans/latin-600.css';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import '@fontsource/jetbrains-mono/latin-700.css';
import './globals.css';
import './workspace.css';
import '../components/Composer.css';
import '../components/Metrics.css';
import '../components/Codebook.css';
import '../components/TreePanel.css';
import '../components/TreeScene3D.css';
import '../components/TreeFlat.css';
import '../components/EncodedOutput.css';

export const metadata: Metadata = {
    title: 'Huffman Coding — build a tree, read the bits',
    description:
        'Build a Huffman tree from any text and watch the codebook, the bitstream and the '
        + 'compression ratio update as you type.'
};

export const viewport: Viewport = {
    themeColor: '#0F172A',
    colorScheme: 'dark',
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
