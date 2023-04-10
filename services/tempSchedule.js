const scheduleLib = require("node-schedule");
const ScheduledNotification = require("../Models/ScheduledNotification");
function schFun() {
  console.log("in schfun");
  const job = scheduleLib.scheduleJob("*/1 * * * *", async function () {
    //console.log("Today is recognized by Rebecca Black!");
    //add boolean field in db as false in sch noti table
    //get data by find query with false
    //filter the data with the createdAt time for which current date matches equal to 15 days
    //iterate with loop for filtered data & add firebase notifi functionality for each iteration
    //after sending succesful noti through firebase, change bool value as true.
    const data = await ScheduledNotification.find({ isSent: false });
    console.log(data);
  });
  return job;
}
schFun();
