import * as React from "react";
import {Link} from "react-router-dom";

const styles = require("./Home.scss");

export default class Huffman extends React.Component {
    public render() {
        return (
            <div>
                <div className={styles.container} data-tid="container">
                    <h2>Main huffman page</h2>
                    <Link to="/">to Main page</Link>
                </div>
            </div>
        );
    }
}
