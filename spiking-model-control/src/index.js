import { Component } from 'react';
import { BrowserRouter, Router, Switch, Route } from "react-router-dom";
import { ModelSelector } from './model-selector.js';
import { ControlPanel } from './control-panel.js';
import history from './history.js';
import ReactDOM from 'react-dom';
import './App.css';

/*
*/

class Selector extends Component {
  render() {
    return (
      <BrowserRouter>
        <Router history = {history}>
          <Switch>
            <Route path="/" exact component={ModelSelector} />
            <Route path="/persist" component={ModelSelector} />
            <Route path="/ControlPanel" component={ControlPanel} />
          </Switch>
        </Router>
      </BrowserRouter>
    );
  }
}

// ========================================

ReactDOM.render(
    <Selector />,
    document.getElementById('root')
  );

