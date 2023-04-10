const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const expressPinoLogger = require("express-pino-logger");
const logger = require("./services/loggerService");

const usersRoutes = require("./Routes/User-routes");
const fileRoutes = require("./Routes/File-routes");
const scansRoutes = require("./Routes/Scans-routes");
const settingRoutes = require("./Routes/Setting-routes");
const chatRoutes = require("./Routes/Chat-routes");
const libraryRoutes = require("./Routes/Library-routes");
const customPagesRoutes = require("./Routes/Custompage-routes");
const doctorRoutes = require("./Routes/Doctor-routes");
const notificationRoutes = require("./Routes/Notification-routes");
//admin routes
const patientRoutes = require("./Routes/Patient-routes");

const PORT = process.env.PORT || 3001;
const { db } = require("./Config/config");

const schedule = require("./services/schedule");

const loggerMidleware = expressPinoLogger({
  logger: logger,
  autoLogging: false,
});
app.use(loggerMidleware);
// app.use(bodyParser.json());

app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ limit: "500mb", extended: true }));
app.use(express.json());

// let db;
mongoose
  .connect(db, {
    useNewUrlParser: true,
    //   useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((client) => {
    console.log("db connected");
  })
  .catch((err) => {
    console.log("error", err.message);
  });

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requseted-With, Content-Type, Accept , Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");

  next();
});

app.use("/api/user", usersRoutes);
app.use("/api/file", fileRoutes);
app.use("/api/setting", settingRoutes);
app.use("/api/scans", scansRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/custompages", customPagesRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/notification", notificationRoutes);

//Admin
app.use("/api/patient", patientRoutes);

app.use("/api/uploads", express.static("uploads"));
app.use("/images", express.static("images"));

app.use("/api", express.static("./"));

schedule.reSchedule();

app.listen(PORT, () => {
  console.log("listening on " + PORT);
});
