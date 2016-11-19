import _ from 'lodash';
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import ChatList from './chat-list';
import Chat from './chat';

import db from '../utils/db';

import '../../style/app.scss';

const ASSIGNED_ADVISER_ID = 'user_1';

const cardStyle = {
  color: 'rgba(0, 0, 0, 0.87)',
  backgroundColor: '#ffffff',
  fontFamily: 'Roboto, sans-serif',
  boxShadow: '0 1px 6px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.12)',
  borderRadius: '2px',
  zIndex: '1'
};

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

        <div className='MainContent' style={cardStyle}>


          <div className='ChatListSidebar'>

            <Tabs value={ selectedTab }>
              <Tab label="My Clients" value='own' onClick={() => this.selectTab('own')}>
                <div>
                  <ChatList
                    chats={ownChats}
                    selectedChat={selectedChat}
                    onSelect={(chat) => this.selectChat(chat) }
                  />
                </div>
              </Tab>
              <Tab label="Unassigned Clients" value='unassigned' onClick={() => this.selectTab('unassigned')}>
                <ChatList
                  chats={unassignedChats}
                  selectedChat={selectedChat}
                  onSelect={(chat) => this.selectChat(chat) }
                />
              </Tab>
            </Tabs>

          </div>
          <div className='ChatContent'>
            <Chat chat={selectedChat}
                  currentUser={{ id : ASSIGNED_ADVISER_ID}}
                  onMessage={(message) => console.log(message)}/>
          </div>

        </div>
      </div>
    )
  }
}
