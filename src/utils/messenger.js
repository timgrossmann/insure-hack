const $ = require('jquery');

const HOST = 'https://5c098415.ngrok.io';

function send ({clientId, agentId, message}) {
  $.post(`${HOST}/agent`, {
    clientId, agentId, message
  })
}

function requestAccountNumber ({clientId, agentId}) {
  send({clientId, agentId, message: '--authenticate'})
}

function offerInsurance ({clientId, agentId}) {
  console.log('offer dog insurance');

  send({clientId, agentId, message: '--doginsurance'})
}

export default {
  send,
  offerInsurance,
  requestAccountNumber
}
