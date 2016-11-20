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
import AccountSettings from './account-settings';
import CloseIcon from 'material-ui/svg-icons/navigation/close';

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
      showAccountSettings: false,
      loggedInAdviserId: null,
      advisers: {}
    };

    db.ref().on('value', (response) => {
      const val = response.val();

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
      sender: this.state.loggedInAdviserId,
      value: message,
      timestamp: Date.now()
    };

    this.setState(update(this.state, {
      chats: {
        [this.state.selectedChatId]: { messages: { [Math.random]: { $set: newMessage } } }
      }
    }));

    messenger.send({
      agentId: this.state.loggedInAdviserId,
      clientId: this.state.selectedChatId,
      message
    })
  }

  requestAccountNumber () {
    messenger.requestAccountNumber({
      agentId: this.state.loggedInAdviserId,
      clientId: this.state.selectedChatId
    });
  }

  offerInsurance () {
    messenger.offerInsurance({
      agentId: this.state.loggedInAdviserId,
      clientId: this.state.selectedChatId
    });
  }

  assignClient () {
    db.ref(`/chat/${this.state.selectedChatId}/assignedAdviser`).set(this.state.loggedInAdviserId);

    this.setState({
      selectedTab: 'own'
    });
  }

  setHolidayMode (isEnabled) {
    this.setState(update(this.state, {
      advisers: { [this.state.loggedInAdviserId]: { onHoliday: { $set: isEnabled } } }
    }));

    db.ref(`/advisers/${this.state.loggedInAdviserId}/onHoliday`).set(isEnabled);
  }

  render () {
    const { selectedTab, selectedChatId, chats, showInfo, loggedInAdviserId, showAccountSettings, advisers } = this.state;

    let infoHTML;
    let mainContentHTML;
    let chatHTML;
    let accountMenuHTML;
    let sidebarHeaderHTML;

    if (!loggedInAdviserId) {

      sidebarHeaderHTML = <h1>Login</h1>;

      mainContentHTML = (
        <AdviserLogin advisers={advisers}
                      onLogin={(adviser) => this.setState({ loggedInAdviserId: adviser.id })}/>
      )

    } else {
      let loggedInAdviser = advisers[loggedInAdviserId];
      let selectedChat = chats && chats[selectedChatId];
      let ownChats = _.pickBy(chats, (chat) => chat.assignedAdviser === loggedInAdviserId);
      let unassignedChats = _.pickBy(chats, (chat) => {
        return (
          chat.assignedAdviser == null ||
          (advisers[chat.assignedAdviser] && advisers[chat.assignedAdviser].onHoliday && chat.assignedAdviser !== loggedInAdviserId)
        );
      });

      sidebarHeaderHTML = <h1>{loggedInAdviser.name}</h1>;

      if (showAccountSettings) {
        accountMenuHTML = (
          <CloseIcon style={{cursor: 'pointer'}}
                     onClick={() => this.setState({showAccountSettings: false})} />
        );

        mainContentHTML = (
          <AccountSettings adviser={loggedInAdviser}
                           onChangeHolidayMode={(isEnabled) => this.setHolidayMode(isEnabled)}/>
        );
      } else {
        accountMenuHTML = (
          <AccountMenu onLogout={() => this.setState({ loggedInAdviserId: null })}
                       onOpenAccountSettings={() => this.setState({ showAccountSettings: true }) }/>
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
      }

      chatHTML = (
        <Chat chat={selectedChat}
              advisers={advisers}
              currentUser={loggedInAdviser}
              onMessage={(message) => this.sendMessage(message)}
              onOpenInfo={() => this.showInfo()}
              onAssignClient={() => this.assignClient()}
              onOfferInsurance={() => this.offerInsurance()}
              onRequestAccountNumber={() => this.requestAccountNumber() }/>
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
              {sidebarHeaderHTML}
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

