import _ from 'lodash';
import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';


export default class Chat extends Component {

  constructor (props, context) {
    super(props, context);

    this.state = {
      message: ''
    };
  }

  submitMessage () {
    if (this.state.message) {
      this.props.onMessage(this.state.message);
      this.setState({ message: '' });
    }
  }

  render () {
    const { chat, currentUser } = this.props;

    if (!_.isObject(chat)) {
      return <div/>;
    }

    const messagesHTML = _(chat.messages)
      .values()
      .sortBy((message) => message.timestamp)
      .map((message, i) => {
        return <Message key={i} message={message} currentUser={currentUser} name={chat.name}/>
      })
      .value();


    return <div>
      <div className='SubHeader'>
        <h1>{chat.name}</h1>
      </div>

      <div className='Messages'>
        {messagesHTML}
      </div>


      <form onSubmit={(e) => {
        e.preventDefault();
        this.submitMessage()
      }}>
        <Toolbar className='ChatContent__Toolbar'>
          <ToolbarGroup style={{ width: '100%' }}>
            <input className='ChatContent__Input'
                   value={this.state.message}
                   onChange={(e) => this.setState({ message: e.target.value })}/>
            <RaisedButton label="Send" primary={true}
                          onClick={() => this.submitMessage()}/>
          </ToolbarGroup>
        </Toolbar>
      </form>
    </div>
  }
}

function Message ({ message, currentUser, name }) {
  let nameHTML;
  const type = message.sender === currentUser.id ? 'send' : 'received';

  if (type === 'received') {

    if (message.sender === '925728457561572') {
      nameHTML = <div className='Message__name'>Bot</div>;

    } else {
      nameHTML = <div className='Message__name'>{name}</div>;
    }
  }


  return (
    <div className={'Message Message--' + type}>
      {nameHTML}
      <div className='Message__inner'>
        {message.value}
      </div>
    </div>
  )
}