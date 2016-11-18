import React, {Component} from 'react';
import {Router, Route, hashHistory} from 'react-router';
import Dashboard from './dashboard';

import '../../style/app.scss';

export default class App extends Component {
  render () {

    return <Dashboard/>;

      /* return (
        <Router history={hashHistory}>
          <Route path="/" component={Home}/>
          <Route path="/detail" component={Detail}/>
        </Router>
    );*/
  }
}
