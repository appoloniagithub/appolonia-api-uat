const admin = require("firebase-admin");
const serviceAccount = require("./Config/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
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

module.exports = (message) => {
  admin
    .messaging()
    .send(message)
    .then((response) => {
      console.log("Successfully sent message: ", response);
    })
    .catch((error) => {
      console.log("error sending msg", error);
    });
};
