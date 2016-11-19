var firebase = require('firebase')

var config = {
  apiKey: "AIzaSyDok1qtvQnRA5jFmPRUU1LND0azPacgQXc",
  authDomain: "insure-hack.firebaseapp.com",
  databaseURL: "https://insure-hack.firebaseio.com",
  storageBucket: "insure-hack.appspot.com",
  messagingSenderId: "740049697542"
}

module.exports = function() {
  return firebase.initializeApp(config)
}