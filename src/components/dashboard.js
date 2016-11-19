import _ from 'lodash';
import update from 'immutability-helper';
import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import { Tabs, Tab } from 'material-ui/Tabs';
import { Card } from 'material-ui/Card';
import ChatList from './chat-list';
import Chat from './chat';
import PersonInfo from './person-info';
import messenger from '../utils/messenger';

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
      selectedChatId: null,
      selectedTab: 'own',
      ownChats: {},
      unassignedChats: {},
      showInfo: true
    };

    db.chat.on('value', (response) => {
      const chats = response.val();

      console.log(chats);

      this.setState({
        ownChats: _.pickBy(chats, (chat) => chat.assignedAdviser === ASSIGNED_ADVISER_ID),
        unassignedChats: _.pickBy(chats, (chat) => chat.assignedAdviser == null)
      });
    });
  }

  hideInfo () {
    this.setState({ showInfo: false });
  }

  showInfo () {
    this.setState({ showInfo: true });
  }

  selectTab (tab) {
    this.setState({ selectedTab: tab });
  }

  selectChat (chat) {
    this.setState({ selectedChatId: chat.id });
  }

  sendMessage (message) {
    const newMessage = {
      sender: ASSIGNED_ADVISER_ID,
      value: message,
      timestamp: Date.now()
    };

    if (this.state.ownChats[this.state.selectedChatId]) {
      this.setState(update(this.state, {
        ownChats: {
          [this.state.selectedChatId] : { messages : { [Math.random] : { $set : newMessage } } }
        }
      }));

    } else if (this.state.unassignedChats[this.state.selectedChatId]) {
      this.setState(update(this.state, {
        unassignedChats: {
          [this.state.selectedChatId] : { messages : { [Math.random] : { $set : newMessage } } }
        }
      }));
    }

    messenger.send({
      agentId: ASSIGNED_ADVISER_ID,
      clientId: this.state.selectedChatId,
      message
    })
  }

  render () {
    const { selectedTab, selectedChatId, ownChats, unassignedChats, showInfo } = this.state;
    const selectedChat = ownChats[selectedChatId] || unassignedChats[selectedChatId];

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
              <Tab label="Others" value='unassigned' onClick={() => this.selectTab('unassigned')}>
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
                  onMessage={(message) => this.sendMessage(message)}
                  onOpenInfo={() => this.showInfo()}/>
          </div>
          { showInfo && selectedChat ? <PersonInfo onClose={() => { this.hideInfo() }} chat={selectedChat} /> : '' }
        </div>
      </div>
    )
  }
}
