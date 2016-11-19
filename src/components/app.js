import _ from 'lodash';
import React, {Component} from 'react';
import Dashboard from './dashboard';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import db from '../utils/db';

const ASSIGNED_ADVISER_ID = 1;


import '../../style/app.scss';

export default class App extends Component {

  constructor (props, context) {
    super(props, context);

    this.state = {
      ownChats: [],
      unassignedChats: []
    };

    db.chat.on('value', (chats) => {
      this.setState({
        ownChats : _.filter(chats, (chat) => chat.assignedAdviser === ASSIGNED_ADVISER_ID),
        unassignedChats: _.filter(chats, (chat) => chat.assignedAdviser === null )
      });
    });
  }

  render () {
    console.log(this.state);

    return (
      <MuiThemeProvider>
        <Dashboard/>
      </MuiThemeProvider>
    );

      /* return (
        <Router history={hashHistory}>
          <Route path="/" component={Home}/>
          <Route path="/detail" component={Detail}/>
        </Router>
    );*/
  }
}
