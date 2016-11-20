import React, {Component} from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Dashboard from './dashboard';

import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#03A9F4',
    accent1Color: '#4FC3F7'
  },
  appBar: {
    height: 50,
  },
});

export default class App extends Component {

  render () {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Dashboard/>
      </MuiThemeProvider>
    );
  }
}
