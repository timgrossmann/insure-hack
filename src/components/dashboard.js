import _ from 'lodash';
import update from 'immutability-helper';
import React, { Component } from 'react';
import { Tabs, Tab } from 'material-ui/Tabs';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import ChatList from './chat-list';
import Chat from './chat';
import PersonInfo from './person-info';
import messenger from '../utils/messenger';
import AdviserLogin from './adviser-login';

import db from '../utils/db';

import '../../style/app.scss';

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
      chats: {},
      showInfo: true,
      loggedInAdviser: null,
      advisers: {}
    };

    db.ref().on('value', (response) => {
      const val = response.val();

      console.log(val);

      this.setState({
        chats: val.chat,
        advisers: val.advisers
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
      sender: this.state.loggedInAdviser.id,
      value: message,
      timestamp: Date.now()
    };

    this.setState(update(this.state, {
      chats: {
        [this.state.selectedChatId]: { messages: { [Math.random]: { $set: newMessage } } }
      }
    }));

    messenger.send({
      agentId: this.state.loggedInAdviser.id,
      clientId: this.state.selectedChatId,
      message
    })
  }

  requestAccountNumber () {
    messenger.requestAccountNumber({
      agentId: this.state.loggedInAdviser.id,
      clientId: this.state.selectedChatId
    });
  }

  offerInsurance () {
    messenger.offerInsurance({
      agentId: this.state.loggedInAdviser.id,
      clientId: this.state.selectedChatId
    });
  }

  assignClient () {
    db.ref(`/chat/${this.state.selectedChatId}/assignedAdviser`).set(this.state.loggedInAdviser.id);

    this.setState({
      selectedTab: 'own'
    });
  }

  render () {
    const { selectedTab, selectedChatId, chats, showInfo, loggedInAdviser, advisers } = this.state;

    let infoHTML;
    let mainContentHTML;
    let chatHTML;
    let accountMenuHTML;

    if (!loggedInAdviser) {
      mainContentHTML = (
        <AdviserLogin advisers={advisers}
                      onLogin={(adviser) => this.setState({ loggedInAdviser: adviser })}/>
      )

    } else {
      let selectedChat = chats && chats[selectedChatId];
      let ownChats = _.pickBy(chats, (chat) => chat.assignedAdviser === loggedInAdviser.id);
      let unassignedChats = _.pickBy(chats, (chat) => chat.assignedAdviser == null);

      accountMenuHTML = (
        <AccountMenu onLogout={() => this.setState({ loggedInAdviser: null })}/>
      );

      mainContentHTML = (
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
      );

      chatHTML = (
        <Chat chat={selectedChat}
              currentUser={loggedInAdviser}
              onMessage={(message) => this.sendMessage(message)}
              onOpenInfo={() => this.showInfo()}
              onAssignClient={() => this.assignClient()}
              onOfferInsurance={() => this.offerInsurance() }
              onRequestAccountNumber={() => this.requestAccountNumber() }
              onAssignAs/>
      );

      if (selectedChat && showInfo) {
        infoHTML = <PersonInfo onClose={() => { this.hideInfo() }} chat={selectedChat}/>
      }
    }

    return (
      <div>
        <div className='MainContent' style={cardStyle}>
          <div className='MainSidebar'>
            <div className='SubHeader'>
              <h1>{loggedInAdviser ? loggedInAdviser.name : 'Login'}</h1>
              {accountMenuHTML}
            </div>
            {mainContentHTML}
          </div>
          <div className='ChatContent'>
            {chatHTML}
          </div>
          {infoHTML}
        </div>
      </div>
    )
  }
}


function AccountMenu ({
  onLogout, onOpenAccountSettings

}) {
  return (
    <IconMenu
      iconButtonElement={<IconButton><MoreVertIcon color='#fff'/></IconButton>}
      anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      targetOrigin={{ horizontal: 'right', vertical: 'top' }}
    >
      <MenuItem primaryText="Logout" onClick={onLogout}/>
      <MenuItem primaryText="Account Settings" onClick={onOpenAccountSettings}/>
    </IconMenu>
  );
}

