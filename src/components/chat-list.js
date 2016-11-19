import _ from 'lodash';
import React, { Component } from 'react';
import { List, ListItem, makeSelectable } from 'material-ui/List';
import Divider from 'material-ui/Divider';


export default class ChatList extends Component {
  render () {
    const { chats, selectedChat, onSelect } = this.props;


    const chatListHTML = _.map(chats, (chat) => {
      let lastText = '';
      const lastMessage = _(chat.messages).values().last();


      if (lastMessage) {
        lastText = lastMessage.value;
      }

      return (
        <ListItem
          key={chat.id}
          primaryText={chat.name}
          secondaryText={lastText}
          secondaryTextLines={1}
          onClick={() => onSelect(chat) }/>
      )
    });

    return (
      <div>
        <List value={0}>
          {chatListHTML}
        </List>
      </div>
    )
  }
}

