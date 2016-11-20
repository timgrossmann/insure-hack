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
dogQuest = {}
questionsStarted = {}

app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === 'token_for_the_test') {
    //console.log("Validating webhook")
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

  switch (message) {
    case '--authenticate':
      needAuth[clientId] = true
      sendAuthenticationRequest(clientId, SERVER_ID, '')
      break
    case '--doginsurance':
      dogQuest[clientId] = { questionNum: 1, answers: {}}
      sendInsuranceQuestion(clientId, SERVER_ID, 'What kind of breed is your dog?\n(e.g. pudel)')
      questionsStarted[clientId] = true
      break
    default:
      sendMessageToClient(clientId, agentId, message)
  }

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

  var messageText = message.text

  if (senderID !== SERVER_ID) {
    if (messageText) {

      //console.log(senderID, recipientID)

      updateMessages(senderID, senderID, timeOfMessage, messageText)

      if (needAuth[senderID]) {
       if(/[0-9]{11}/.test(messageText)) {

         sendMessageToClient(senderID, recipientID, 'Thank you!\nYou have successfully authenticated')
         needAuth[senderID] = false
         addInsuranceIdToClient(senderID, messageText)

       } else if (messageText === 'Call me to verify') {
         sendMessageToClient(senderID, recipientID, 'I am sorry, i have no free timeslots today.')
         needAuth[senderID] = false
       }
      } else if (questionsStarted[senderID]) {

        switch(dogQuest[senderID].questionNum) {
          case 1:
            if (messageText.indexOf('?') === -1 && messageText.split(' ').length === 1) {
              dogQuest[senderID].questionNum += 1
              dogQuest[senderID].answers[1] = messageText
              sendInsuranceQuestion(senderID, recipientID, 'What is his chipnumber ?\n(You can find it in his idcard)')
            } else {
              sendMessageToClient(senderID, recipientID, 'Your Message will be forwarded to your agent.')
            }
            break
          case 2:
            if (messageText.indexOf('?') === -1 && messageText.length === 3) {
              dogQuest[senderID].questionNum += 1
              dogQuest[senderID].answers[2] = messageText
              sendInsuranceQuestionReplies(senderID, recipientID, 'Is it a compulsory insurance ?\n(yes/no)')
            } else {
              sendMessageToClient(senderID, recipientID, 'Your Message will be forwarded to your agent.')
            }
            break
          case 3:
            if (messageText.indexOf('?') === -1 && (messageText === 'yes' || messageText === 'no')) {
              dogQuest[senderID].answers[3] = messageText
              sendMessageToClient(senderID, recipientID, 'Thank you!\nYour offer is being created')
              sendOfferToClient(senderID, recipientID)
              questionsStarted[senderID] = false
            } else {
              sendMessageToClient(senderID, recipientID, 'Your Message will be forwarded to your agent.')
            }
        }
      } else {
        switch (messageText) {
          case 'help':
            sendHelpMessage(senderID, recipientID, '')
            break
          default:
            break
        }
      }
    }
  }
}

function sendOfferToClient (clientId, agentId) {

  getPrice(clientId).then(function (price) {
    var subtitle = "Your personal, special insurhack offer! Only " + price.yearly + "€/year or " + price.monthly + "€/month"

    var secondMessageData = {
      recipient: {
        id: clientId
      },
      sender: {
        id: agentId
      },
      message: {
        text: subtitle
      }
    }

    var messageData = {
      recipient: {
        id: clientId
      },
      sender: {
        id: agentId
      },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
              title: 'Dog Insurance',
              subtitle: subtitle,
              item_url: "https://www.zurich.com",
              image_url: "http://www.smartinvestor.com.my/wp-content/uploads/zurich-logo.jpg",
              buttons: [{
                type: "web_url",
                url: "https://www.zurich.com",
                title: "Check out the offer"
              }],
            }]
          }
        }
      }
    }

    callSendAPI(messageData)

    callSendAPI(secondMessageData)
  })
}

function getPrice(clientId) {
  return new Promise(function (resolve, reject) {

    var cAns = { 1: 'pitbull', 2: '123', 3: 'yes'}

    var token = '5974c270-a21b-3618-8056-3a2c0c0b8d31'
    var requestBody = require('./requestBody')(cAns[1], cAns[2], cAns[3])

    request({
      uri: 'https://api.insurhack.com/apis/gi/1//PolicyPeriod_Set/zde.actions.GetRating',
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: requestBody,
      method: 'POST',

    }, function (error, response, body) {
      if (!error && response.statusCode == 201) {
        var recipientId = body.recipient_id
        var messageId = body.message_id

        var yearlyPrice = body.CostsSummary.GrossPremium.Amount
        var monthlyPrice = body.CostsSummary.GrossPremiumPerPaymentPeriod.Amount

        resolve({ 'yearly': yearlyPrice, 'monthly': monthlyPrice })
      } else {
        console.error("Unable to send message.", error)
      }
    })

  })
}

function addInsuranceIdToClient (clientId, insuranceId) {
  var chat = firebase.database().ref('chat/' + clientId + '/insuranceId')
  chat.set(insuranceId)
}

function updateMessages (clientId, sender, timestamp, message) {

  //console.log('updateMessage', clientId, sender)

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
      addUser(clientId, sender, message, timestamp).then(function (result) {
        sendMessageToClient(clientId, SERVER_ID, 'Your Agent was informed.\n\You will receive a response very soon.')
      })
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

function addUser (clientId, sender, message, timestamp) {
  return new Promise(function (resolve, reject) {
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
        //console.log('User added')
        resolve()
      })
    })
  })
}

function sendInsuranceQuestionReplies (clientId, agentId, message) {
  //console.log('Questions started')

  var messageData = {
    "recipient": {
      "id": clientId
    },
    message: {
      text: message,
      quick_replies: [
        {
          content_type: "text",
          title: "yes",
          payload: "yes_to_insurance"
        },
        {
          content_type: "text",
          title: "no",
          payload: "no_to_insurance"
        }
      ]
    }
  }

  updateMessages(clientId, agentId, Date.now(), message)

  callSendAPI(messageData)
}

function sendInsuranceQuestion (clientId, agentId, message) {
  //console.log('Questions started')

  var messageData = {
    "recipient": {
      "id": clientId
    },
    message: {
      text: message,
    }
  }

  updateMessages(clientId, agentId, Date.now(), message)

  callSendAPI(messageData)
}


function sendAuthenticationRequest (recipientId, agentId, message) {
  //console.log('Asked for authentification required')

  message = "Please verify your social security number.\nEither send it per Messenger or tell me to call you.\n\n" +
    "You can find it on your insurance card."

  var messageData = {
    "recipient": {
      "id": recipientId
    },
    message: {
      text: message,
      quick_replies: [
        {
          content_type: "text",
          title: "Call me to verify",
          payload: "Call_client_by_phone"
        }
      ]
      }
    }

  updateMessages(recipientId, agentId, Date.now(), message)

  callSendAPI(messageData)
}

function sendHelpMessage(recipientId, agentId, message) {
  message = 'Ask me anything you want about your insurance or any insurance related questions.\nI will answer them as soon as possible.'

  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: message
    }
  }

  updateMessages(recipientId, agentId, Date.now(), message)

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

  //console.log('Answer from Agent: ', messageText)

  updateMessages(recipientId, agentId, Date.now(), messageText)

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
        resolve({ firstName: 'unknown', lastName: 'unknown', userImg: 'unknown' })
      }
    })
  })
}

app.listen(80)
