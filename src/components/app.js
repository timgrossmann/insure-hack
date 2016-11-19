import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dashboard from './dashboard';

export default class App extends Component {

  render () {
    return (
      <MuiThemeProvider>
        <Dashboard/>
      </MuiThemeProvider>
    );
  }
}
