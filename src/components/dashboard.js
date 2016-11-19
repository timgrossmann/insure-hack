import _ from 'lodash';
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import ChatList from './chat-list';


import db from '../utils/db';

import '../../style/app.scss';

const ASSIGNED_ADVISER_ID = 'user_1';

export default class Dashboard extends Component {
  constructor (props, context) {
    super(props, context);

    this.state = {
      selectedChat: null,
      selectedTab: 'own',
      ownChats: [],
      unassignedChats: []
    };

    db.chat.on('value', (response) => {
      const chats = _.values(response.val());

      console.log(chats);


      this.setState({
        ownChats: _.filter(chats, (chat) => chat.assignedAdviser === ASSIGNED_ADVISER_ID),
        unassignedChats: _.filter(chats, (chat) => chat.assignedAdviser == null)
      });
    });
  }

  selectTab (tab) {
    this.setState({ selectedTab: tab });
  }

  selectChat (chat) {
    this.setState({ selectedChat: chat });
  }

  render () {
    const { selectedTab, selectedChat, ownChats, unassignedChats } = this.state;

    return (
      <div>
        <AppBar
          title="Messages"
          showMenuIconButton={false}
        />

        <Card className='MainContent'>


            <div className='ChatListSidebar'>

              <Tabs value={ selectedTab }>
                <Tab label="My Clients" value='own' onClick={() => this.selectTab('own')}>
                  <div>
                    <ChatList
                      chats={ownChats}
                      selectedChat={selectedChat}
                      onSelect={() => this.selectChat() }
                    />
                  </div>
                </Tab>
                <Tab label="Unassigned Clients" value='unassigned' onClick={() => this.selectTab('unassigned')}>
                  <ChatList
                    chats={unassignedChats}
                    selectedChat={selectedChat}
                    />
                </Tab>
              </Tabs>

            </div>
            <div className='ChatContent'>


            </div>

        </Card>
      </div>
    )
  }
}
