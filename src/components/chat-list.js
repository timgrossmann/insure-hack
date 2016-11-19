import _ from 'lodash';
import React, { Component } from 'react';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';


export default class ChatList extends Component {
  render () {
    const { chats, selectedChat, onSelect } = this.props;

    const chatListHTML = _.map(chats, (chat, i) => (
      <ListItem
        key={chat.id}
        primaryText={chat.name}
        secondaryText={_.last(chat.messages).value}
        secondaryTextLines={1}
        onClick={() => this.onSelect(chat) }
      />
    ));

    return (
      <div>
        <List>
          {chatListHTML}
        </List>
      </div>
    )
  }
}

