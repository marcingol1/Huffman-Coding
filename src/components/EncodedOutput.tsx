import * as React from 'react';
import './EncodedOutput.css';
import Icon from './Icon';
import { formatBits, groupBits } from '../utils/format';

interface Props {
    encoded: string;
    originalBits: number;
}

interface State {
    copied: boolean;
}

/** navigator.clipboard predates this project's lib.dom, so it is described here. */
interface ClipboardCapableNavigator {
    clipboard?: {
        writeText: (text: string) => Promise<void>;
    };
}

class EncodedOutput extends React.Component<Props, State> {
    state: State = {
        copied: false
    };

    private resetTimer: number;

    componentWillUnmount() {
        window.clearTimeout(this.resetTimer);
    }

    copy = (): void => {
        const text = this.props.encoded;
        const nav = window.navigator as Navigator & ClipboardCapableNavigator;

        if (nav.clipboard && nav.clipboard.writeText) {
            nav.clipboard.writeText(text).then(this.confirmCopy, this.copyWithSelection);
        } else {
            this.copyWithSelection();
        }
    }

    /** Clipboard API needs a secure context; a hidden textarea covers the rest. */
    copyWithSelection = (): void => {
        const scratch = document.createElement('textarea');
        scratch.value = this.props.encoded;
        scratch.setAttribute('readonly', '');
        scratch.style.position = 'fixed';
        scratch.style.opacity = '0';
        document.body.appendChild(scratch);
        scratch.select();
        document.execCommand('copy');
        document.body.removeChild(scratch);
        this.confirmCopy();
    }

    confirmCopy = (): void => {
        this.setState({ copied: true });
        window.clearTimeout(this.resetTimer);
        this.resetTimer = window.setTimeout(() => this.setState({ copied: false }), 2000);
    }

    render() {
        const { encoded, originalBits } = this.props;
        const copied = this.state.copied;
        const savedBits = originalBits - encoded.length;

        return (
            <section className="panel encoded" aria-labelledby="encoded-title">
                <div className="panel__head">
                    <h2 className="panel__title" id="encoded-title">
                        <Icon name="copy"/>
                        Encoded bitstream
                    </h2>
                    <button
                        type="button"
                        className={'btn btn--sm' + (copied ? ' btn--accent' : '')}
                        onClick={this.copy}
                        disabled={!encoded}
                    >
                        <Icon name={copied ? 'check' : 'copy'} size={15}/>
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                </div>

                <div className="panel__body">
                    {encoded ? (
                        <React.Fragment>
                            <p className="encoded__stream num" aria-label="Encoded bitstream">
                                {groupBits(encoded).map( (group, index) => (
                                    <span key={index} className="encoded__group">{group}</span>
                                ))}
                            </p>
                            <p className="encoded__summary" aria-live="polite">
                                <span className="num">{formatBits(encoded.length)}</span> bits
                                <span className="encoded__sep">·</span>
                                <span className="num encoded__saved">{formatBits(savedBits)}</span> saved
                                against {formatBits(originalBits)} at 8 bits per character
                            </p>
                        </React.Fragment>
                    ) : (
                        <div className="empty">
                            <p className="empty__title">No bits yet</p>
                            <p className="empty__hint">
                                The encoded stream appears here once the source text has something in it.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        );
    }
}

export default EncodedOutput;
