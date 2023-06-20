const admin = require("firebase-admin");
const serviceAccount = require("../Config/firebase.json");
const FIREBASE_DATABASE_URL = require("../Config/config");
//const getDatabase = require("firebase/database");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_DATABASE_URL,
});

// function createMsg(token, title, body) {
//   return {
//     token: token,
//     notification: {
//       title: title,
//       body: body,
//     },
//   };
// }

module.exports = {
  sendPushNotification: function (message) {
    admin
      .messaging()
      .send(message)
      .then((response) => {
        console.log("Successfully sent message: ", response);
      })
      .catch((error) => {
        console.log("error sending msg", error);
      });
  },
  scheduleNotification: function () {
    const firebaseAdmin = {};
    firebaseAdmin.sendMulticastNotification = function (payload) {
      const message = {
        notification: {
          title: payload.title,
          body: payload.body,
        },
        tokens: payload.tokens,
        data: payload.data || {},
      };

      return admin.messaging().sendMulticast(message);
    };
  },
};
