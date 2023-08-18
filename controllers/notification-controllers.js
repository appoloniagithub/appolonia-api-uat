const Notification = require("../Models/Notification");
const schedule = require("../services/schedule");
const ScheduledNotification = require("../Models/ScheduledNotification");
const User = require("../Models/User");

const getAllNotifications = async (req, res) => {
  const { userId } = req.body;
  try {
    // let allNotifications = await Notification.find({
    //   $or: [{ userId: userId }, { isRead: "0" }],
    // });
    let foundNotifications = await Notification.find({ userId: userId });
    // let foundUnread = await Notification.find({ isRead: "0" });
    // let [foundNotificationsResolved, foundUnreadResolved] = await Promise.all([
    //   foundNotifications,
    //   foundUnread,
    // ]);

    // console.log(foundNotificationsResolved, foundUnread, "noti");
    // let allNotifications = [
    //   ...foundNotificationsResolved,
    //   ...foundUnreadResolved,
    // ];
    //console.log(allNotifications, "all");
    if (foundNotifications.length > 0) {
      Notification.updateMany(
        { userId: userId },
        { $set: { isRead: "1" } },
        async (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("data updated");
            const temp = await Notification.find({
              $and: [{ userId: userId }, { isRead: "0" }],
            });
            console.log(temp, "temp");
            res.json({
              serverError: 0,
              message: "Notifications Found",
              data: {
                success: 1,
                allNotifications: foundNotifications.reverse(),
              },
            });
          }
        }
      );
    } else {
      res.json({
        serverError: 0,
        message: "Found No Notifications",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.send({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const createNotification = async (req, res) => {
  const { title, body, actionId, actionName, userId } = req.body;
  console.log(req.body);
  try {
    let newNotification = new Notification({
      title,
      body,
      actionId,
      actionName,
      userId,
      isRead: "0",
    });
    newNotification.save((err, data) => {
      if (err) {
        console.log(err);
        throw new Error("Error saving the Notification");
      } else {
        console.log(data);
        res.json({
          serverError: 0,
          message: "New Notification added.",
          data: {
            success: 1,
            notification: data,
          },
        });
        return;
      }
    });
  } catch (err) {
    console.log(err);
    res.send({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const sendNotification = async (req, res) => {
  const { title, body, sendTo } = req.body;
  console.log(req.body);
  try {
    let notification = new Notification({
      title: title,
      body: body,
      sendTo: sendTo,
    });
    notification.save((err, data) => {
      if (err) {
        console.log(err);
        throw new Error("Error saving the Notification");
      } else {
        console.log(data);
        res.json({
          serverError: 0,
          message: "New Notification added.",
          data: {
            success: 1,
            notification: data,
          },
        });
        return;
      }
    });
  } catch (err) {
    console.log(err);
    res.send({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const schNotification = async (req, res) => {
  try {
    const payload = {
      // time: req.body.time,
      days: req.body.days,
      title: req.body.title,
      body: req.body.body,
      scanType: req.body.scanType,
    };
    await schedule.createSchedule(payload);
    res.json({
      data: {},
      message: "Success",
      success: true,
    });
  } catch (e) {
    res.status(400).json({
      message: e.message,
      success: false,
    });
  }
};

const getSchNotification = async (req, res) => {
  try {
    const list = schedule.getJobs();
    const keys = Object.keys(list);

    let schedules = await ScheduledNotification.find({});

    schedules = schedules.filter((item) => keys.includes(item._id.toString()));

    res.json({
      data: { schedules },
      status: "success",
      message: "successfull",
    });
  } catch (e) {
    res.status(400).json({ message: e.message, success: false });
  }
};

const deleteSchNotification = async (req, res) => {
  try {
    const jobId = req.body.id;
    const list = schedule.getJobs();
    const currentJob = list[jobId];

    if (!currentJob) throw new Error("Job not found");

    await ScheduledNotification.findByIdAndRemove(jobId);

    currentJob.cancel();

    res.json({
      data: {},
      status: "success",
      message: "successfull",
    });
  } catch (e) {
    res.status(400).json({ message: e.message, success: false });
  }
};

module.exports = {
  getAllNotifications,
  createNotification,
  schNotification,
  getSchNotification,
  deleteSchNotification,
  sendNotification,
};
