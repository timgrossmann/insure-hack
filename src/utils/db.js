/* global firebase */

var config = {
  apiKey: "AIzaSyDok1qtvQnRA5jFmPRUU1LND0azPacgQXc",
  authDomain: "insure-hack.firebaseapp.com",
  databaseURL: "https://insure-hack.firebaseio.com",
  storageBucket: "insure-hack.appspot.com",
  messagingSenderId: "740049697542"
};

firebase.initializeApp(config);

export default {
  chat: firebase.database().ref('chat')
};
