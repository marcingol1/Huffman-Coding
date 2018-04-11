import * as React from "react";
import {Route, Switch} from "react-router";
import Huffman from "./components/Huffman";
import App from "./containers/App";
import HomePage from "./containers/HomePage";

export default () => (
    <App>
        <Switch>
            <Route path="/huffman" component={Huffman}/>
            <Route path="/" component={HomePage}/>
        </Switch>
    </App>
);
