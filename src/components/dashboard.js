import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';





export default class Dashboard extends Component {
  render () {

    return (
      <AppBar
        title="Messages"
        showMenuIconButton={false}
      />
    )
  }
}
