const Notification = require("../Models/Notification");

const getAllNotifications = async (req, res) => {
  const { userId } = req.body;
  try {
    let allNotifications = await Notification.find({
      $or: [{ userId: userId }, { isRead: "0" }],
    });
    // let foundNotifications = await Notification.find({ userId: userId });
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
    console.log(allNotifications, "all");
    if (allNotifications.length > 0) {
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
                allNotifications: temp,
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
            //{
            //   title: title,
            //   body: body,
            //   actionId: actionId,
            //   actionName: actionName,
            //   userId: userId,
            //   isRead: "0",
            // },
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
module.exports = {
  getAllNotifications,
  createNotification,
};
