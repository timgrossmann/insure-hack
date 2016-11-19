var express = require('express')
var bodyParser = require("body-parser")
var request = require('request')

var firebase = require('./firebase')()

var app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

SERVER_ID = '925728457561572'

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

  sendMessageToClient(clientId, message)
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
  var timeOfMessage = new Date().toISOString()
  var message = event.message

  //console.log(senderID, recipientID)

  var messageId = message.mid

  var messageText = message.text
  var messageAttachments = message.attachments

  if (senderID === SERVER_ID) {
    updateMessages(recipientID, senderID, timeOfMessage, messageText)
  } else {
    if (messageText) {

      updateMessages(senderID, senderID, timeOfMessage, messageText)

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
        default:
          sendMessageToAgent(senderID, messageText)
      }
    } else if (messageAttachments) {
      sendTextMessage(senderID, "Message with attachment received")
    }
  }
}

function updateMessages (clientId, sender, timestamp, message) {

  checkForUser(clientId).then(function (result) {
    if (result) {
      chat = firebase.database().ref('chat/' + clientId)
      var newMessage = {
        sender: sender,
        value: message,
        timestamp: timestamp
      }

      firebase.database().ref('chat/' + clientId + '/messages').push(newMessage)
      console.log(message, 'added')

    } else {
      addUser(clientId, message, timestamp)
    }
  })
}

function checkForUser (clientId) {
  chat = firebase.database().ref('chat/' + clientId)
  return chat.once('value').then(function (snapshot) {
    if (snapshot.val()) {
      return true
    } else {
      return false
    }
  })
}

function addUser (clientId, message, timestamp) {
  chat = firebase.database().ref('chat/' + clientId)
  chat.once('value').then(function (snapshot) {

    var userData = {
      id: clientId,
      name: 'test',
      assingedAdviser: null,
      value: {},
    }

    var newMessage = {
      'sender': clientId,
      'value': message,
      'timestamp': new Date().toISOString()
    }

    chat.set(userData)

    firebase.database().ref('chat/' + clientId).child('/messages/').push(newMessage)
    console.log('User added')
  })
}

function sendButtonSelection(recipientId) {
  var messageData = {
    "recipient": {
      "id": recipientId
    },
    "message": {
      "text": "How many square Meters is your flat?:",
      "quick_replies": [
        {
          "content_type": "text",
          "title": "20m^2",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_20"
        },
        {
          "content_type": "text",
          "title": "40^2",
          "payload": "DEVELOPER_DEFINED_PAYLOAD_FOR_40"
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

function sendMessageToClient(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  }

  console.log('Answer from Agent: ', messageText)

  callSendAPI(messageData)
}

function sendMessageToAgent(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: 'Your Agent was informed.\n\ You will receive a response very soon.'
    }
  }

  //console.log('Agent contacted with Message: ', messageText)

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

      //console.log("Successfully sent generic message with id %s to recipient %s",
        //messageId, recipientId)
    } else {
      console.error("Unable to send message.")
      //console.error(response)
      //console.error(error)
    }
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
