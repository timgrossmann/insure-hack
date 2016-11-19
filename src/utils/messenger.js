const $ = require('jquery');

const HOST = 'https://5c098415.ngrok.io';

function send ({clientId, agentId, message}) {
  $.post(`${HOST}/agent`, {
    clientId, agentId, message
  })
}

export default {
  send
}
