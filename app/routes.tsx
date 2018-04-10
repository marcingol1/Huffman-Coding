import * as React from "react";
import {Route, Switch} from "react-router";
import Huffman from "./components/Huffman";
import App from "./containers/App";
import CounterPage from "./containers/CounterPage";
import HomePage from "./containers/HomePage";

export default () => (
    <App>
        <Switch>
            <Route path="/counter" component={CounterPage}/>
            <Route path="/huffman" component={Huffman}/>
            <Route path="/" component={HomePage}/>
        </Switch>
    </App>
);
