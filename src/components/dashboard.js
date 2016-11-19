import _ from 'lodash';
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';

import FlatButton from 'material-ui/FlatButton';


import db from '../utils/db';

import '../../style/app.scss';

const ASSIGNED_ADVISER_ID = 1;

export default class Dashboard extends Component {
  constructor (props, context) {
    super(props, context);

    this.state = {
      selectedTab: 'own',
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

  selectTab (tab) {
    this.setState({ selectedTab: tab });
  }

  render () {

    const { selectedTab, ownChats, unassignedChats } = this.state;

    return (
      <div>
        <AppBar
          title="Messages"
          showMenuIconButton={false}
        />




        <Tabs value={ selectedTab }>
          <Tab label="My Clients" value='own' onClick={() => this.selectTab('own')}>
            <div>
              My clients
            </div>
          </Tab>
          <Tab label="Unassigned Clients" value='unassigned' onClick={() => this.selectTab('unassigned')}>
            unassigned
          </Tab>
        </Tabs>

      </div>
    )
  }
}
