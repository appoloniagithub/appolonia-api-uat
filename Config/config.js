const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  db: process.env.DB,
  JWTKEY: process.env.JWT,
  SMTPPASS: process.env.SMTPPASS,
  authToken: process.env.authToken,
  accountSid: process.env.accountSid,
  // db: "mongodb+srv://appolonia:database99$@underdevelopment.neb6qwe.mongodb.net/?retryWrites=true&w=majority",
  // JWTKEY: "APPOLONIAPRIVATEKEY",
  // SMTPPASS: "mxnqbnuiaradsmxe",
  // authToken: "b9225b8197ffd15bfa62c4e997060e14",
  // accountSid: "AC05d6ccacda0201d3e850b4ce60c773af",
};
