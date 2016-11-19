var bodyParser = require("body-parser")
var express = require('express')
var firebase = require('./firebase')()
var request = require('request')
var app = express()

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}

app.use(allowCrossDomain);
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

SERVER_ID = '925728457561572'
needAuth = {}


app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'token_for_the_test') {
    console.log("Validating webhook")
    res.status(200).send(req.query['hub.challenge'])

  } else {
    console.error("Failed validation. Make sure the validation tokens match.")
    res.sendStatus(403)
  }
})

app.post('/agent', function (req, res) {
  var data = req.body

  var message = data.message
  var clientId = data.clientId
  var agentId = data.agentId

  //console.log(clientId, agentId, message)

  sendMessageToClient(clientId, agentId, message)
  res.end()
})

app.post('/webhook', function (req, res) {
  var data = req.body

  if (data.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id
      var timeOfEvent = entry.time

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        if (event.postback) {
          receivedPostback(event)
        } else if (event.message) {
          receivedMessage(event)
        } else {
          //console.log("Webhook received unknown event")
        }
      })
    })

    res.sendStatus(200)
  }
  res.end()
})

function receivedMessage(event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfMessage = Date.now()
  var message = event.message

  //console.log(senderID, recipientID)

  var messageId = message.mid

  var messageText = message.text
  var messageAttachments = message.attachments

  if (!/^\d+$/.test(senderID)) {
    switch (messageText) {
      case 'authenticate':
        needAuth[recipientID] = true
        sendAuthenticationRequest(recipientID)
        break
    }
  } else if (senderID !== SERVER_ID) {
    if (messageText) {

      updateMessages(senderID, senderID, timeOfMessage, messageText)

      if (needAuth[senderID]) {
       if(/[0-9]{3}-[0-9]{2}-[0-9]{4}/.test(messageText)) {
         sendMessageToClient(senderID, senderID, 'Thank you!\nYou have succefully authenticated')
         needAuth[senderID] = false
       } else if (messageText === 'Call me to verify') {
         sendMessageToClient(senderID, senderID, 'Sure, I will call you soon.')
         needAuth[senderID] = false
       }
      } else {
        switch (messageText) {
          case 'buttons':
            sendButtonSelection(senderID)
            break
          case 'help':
            sendHelpMessage(senderID)
            break
          case 'generic':
            sendGenericMessage(senderID)
            break
          case 'authenticate':
            needAuth[senderID] = true
            sendAuthenticationRequest(senderID)
            break
          default:
            break
        }
      }
    }
  }
}

function updateMessages (clientId, sender, timestamp, message) {

  checkForUser(clientId).then(function (result) {
    if (result) {
      firebase.database().ref('chat/' + clientId)
      var newMessage = {
        sender: sender,
        value: message,
        timestamp: timestamp
      }

      firebase.database().ref('chat/' + clientId + '/messages').push(newMessage)
      //console.log(message, 'added')

    } else {
      addUser(clientId, message, timestamp)
      sendMessageToAgent(clientId, 'Your Agent was informed.\n\ You will receive a response very soon.')
    }
  })
}

function checkForUser (clientId) {
  const chat = firebase.database().ref('chat/' + clientId)
  return chat.once('value').then(function (snapshot) {
    if (snapshot.val()) {
      return true
    } else {
      return false
    }
  })
}

function addUser (clientId, message, timestamp) {
  const chat = firebase.database().ref('chat/' + clientId)
  chat.once('value').then(function (snapshot) {

    getUserInfo(clientId).then(function (result) {
      var userData = {
        id: clientId,
        name: result.firstName + ' ' + result.lastName,
        img: result.userImg,
        assingedAdviser: null,
        value: {},
      }

      var newMessage = {
        'sender': clientId,
        'value': message,
        'timestamp': Date.now()
      }

      chat.set(userData)

      firebase.database().ref('chat/' + clientId).child('/messages/').push(newMessage)
      console.log('User added')
    })
  })
}

function sendAuthenticationRequest (recipientId) {
  console.log('Asked for authentification required')

  var messageData = {
    "recipient": {
      "id": recipientId
    },
    message: {
      text: "Please verify your insurance social security number.\nEither send it per Messenger or tell me to call you.",
      quick_replies: [
        {
          content_type: "text",
          title: "Call me to verify",
          payload: "Call_client_by_phone"
        }
      ]
      }
    }

  callSendAPI(messageData)
}

function sendButtonSelection(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "How many square Meters is your flat?:",
      quick_replies: [
        {
          content_type: "text",
          title: "20m^2",
          payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_20"
        },
        {
          content_type: "text",
          title: "40^2",
          payload: "DEVELOPER_DEFINED_PAYLOAD_FOR_40"
        }
      ]
    }
  }

  callSendAPI(messageData)
}

function sendHelpMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Ask me anything you want about your insurance or any insurance related questions.\nI will answer them as soon as possible.'
    }
  }

  callSendAPI(messageData)
}

function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Next-generation virtual reality",
            item_url: "https://www.oculus.com/en-us/rift/",
            image_url: "http://messengerdemo.parseapp.com/img/rift.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Your Hands, Now in VR",
            item_url: "https://www.oculus.com/en-us/touch/",
            image_url: "http://messengerdemo.parseapp.com/img/touch.png",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  }

  callSendAPI(messageData)
}

function sendMessageToClient(recipientId, agentId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    sender: {
      id: agentId
    },
    message: {
      text: messageText
    }
  }

  console.log('Answer from Agent: ', messageText)

  updateMessages(recipientId, agentId, Date.now(), messageText)
  if (agentId !== SERVER_ID) {
    callSendAPI(messageData)
  }
}

function sendMessageToAgent(agentId, messageText) {
  var messageData = {
    recipient: {
      id: agentId
    },
    message: {
      text: messageText
    }
  }

  callSendAPI(messageData)
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAZAQD7oFTL4BAMqRRK7uNA3TmEl2uDcfM4m8IuTvBlqGvm2NvtwLFp60CAWw9z50lsuJZBS7gwHbIUX7KcWhNoOp4jdE6y34UycE09pCdHBBVOSXwm67sOrSQVVtA0N0WcVly6q4f32ZBtsX0a2eaO0B6rJ9SXwhEnsfZAZC4QZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id
      var messageId = body.message_id

    } else {
      console.error("Unable to send message.")
    }
  })
}

function getUserInfo (userId) {
  return new Promise(function (resolve, reject) {
    request({
      uri: 'https://graph.facebook.com/v2.6/' + userId,
      qs: {
        access_token: 'EAAZAQD7oFTL4BAMqRRK7uNA3TmEl2uDcfM4m8IuTvBlqGvm2NvtwLFp60CAWw9z50lsuJZBS7gwHbIUX7KcWhNoOp4jdE6y34UycE09pCdHBBVOSXwm67sOrSQVVtA0N0WcVly6q4f32ZBtsX0a2eaO0B6rJ9SXwhEnsfZAZC4QZDZD',
        fields: 'first_name,last_name,profile_pic,locale,timezone,gender'},
      method: 'GET'
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var parsedBody = JSON.parse(body)

        var firstName = parsedBody.first_name
        var lastName = parsedBody.last_name
        var userImg = parsedBody.profile_pic

        resolve({ firstName: firstName, lastName: lastName, userImg: userImg })
      } else {
        console.error("Unable to send message.")
        resolve('unknown')
      }
    })
  })
}

function receivedPostback(event) {
  var senderID = event.sender.id
  var recipientID = event.recipient.id
  var timeOfPostback = event.timestamp

  var payload = event.postback.payload

  console.log("Received postback for user %d and page %d with payload '%s' " +
    "at %d", senderID, recipientID, payload, timeOfPostback)

  sendMessageToAgent(senderID, "Postback called")
}

app.listen(80)
