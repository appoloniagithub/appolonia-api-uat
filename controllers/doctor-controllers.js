const Doctor = require("../Models/Doctor");
const Role = require("../Models/Role");
const User = require("../Models/User");
var otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { JWTKEY, SMTPPASS, accountSid, authToken } = require("../Config/config");
const bcrypt = require("bcryptjs");
var CryptoJS = require("crypto-js");
let doctorSchema = require("../Models/Doctor");
let eventSchema = require("../Models/Events");
const jwt = require("jsonwebtoken");
const Scans = require("../Models/Scans");
const Event = require("../Models/Events");
const Appointment = require("../Models/Appointment");
const moment = require("moment");

const addDoctor = async (req, res) => {
  let imageFiles = [];
  if (req?.files?.length > 0) {
    console.log(req.files, "here are the files");
    imageFiles = req.files.map((file) => file.path);
  }
  const {
    firstName,
    lastName,
    email,
    emiratesId,
    phoneNumber,
    speciality,
    clinicName,
    image,
    password,
    role,
    gender,
    nationality,
    totalExperience,
    profile,
    certifications,
    education,
  } = req.body;
  //console.log(req.body);

  if (
    firstName &&
    lastName &&
    email &&
    phoneNumber &&
    speciality &&
    role &&
    password
  ) {
    let hashedpassword;
    let hashedemiratesId;
    try {
      hashedpassword = await bcrypt.hash(password, 12);
      hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
      console.log(hashedemiratesId, "i am emirates");
    } catch (err) {
      console.log("Something went wrong while Encrypting Data", err);

      throw new Error("Something went wrong while Encrypting Data");
    }

    let existingDoctor = await Doctor.findOne({
      $or: [{ email: email }, { phoneNumber: phoneNumber }],
    });
    console.log(existingDoctor, "existing doctor");
    if (existingDoctor) {
      res.json({
        serverError: 0,
        message: "Doctor with this email ID (or) phone number already exists",
        data: {
          success: 0,
          status: 409,
        },
      });
      return;
    } else {
      doctorSchema.create(
        {
          ...req.body,
          image: imageFiles.toString().replace(/\\/g, "/"),
          password: hashedpassword,
          uniqueId: password,
          phoneNumber: `+${phoneNumber}`,
          //emiratesId: hashedemiratesId,
        },
        (error, data) => {
          if (error) {
            return next(error);
          } else {
            console.log(data);
            res.json({
              serverError: 0,
              message: "Doctor created successfully",
              data: data,
              success: 1,
              status: 200,
            });
          }
        }
      );
    }
  } else {
    res.json({
      serverError: 0,
      message: "Please enter all the mandatory fields",
      data: {
        success: 0,
        status: 400,
      },
    });
    return;
  }
};

const getAllDoctors = async (req, res) => {
  try {
    let foundDoctors = Doctor.find({ role: "Doctor" });
    let foundClinicAdmin = Doctor.find({ role: "Clinic Admin" });
    let [foundDoctorsResolved, foundClinicAdminResolved] = await Promise.all([
      foundDoctors,
      foundClinicAdmin,
    ]);
    console.log(foundDoctorsResolved, "found doctors resolved");

    foundDoctors = [...foundDoctorsResolved, ...foundClinicAdminResolved];
    if (foundDoctors.length > 0) {
      res.json({
        serverError: 0,
        message: "Doctors Found",
        data: {
          doctors: foundDoctors,
          success: 1,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Doctors Found",
        data: {
          doctors: foundDoctors,
          success: 1,
        },
      });
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        // doctors: doctors,
        success: 0,
      },
    });
  }
};

// const getDoctor = async (req, res) => {
//   doctorSchema.findById(req.params.id, (error, data) => {
//     if (error) {
//       return next(error);
//     } else {
//       res.json({
//         serverError: 0,
//         msg: "Doctor found",
//         data: data,
//         success: 1,
//       });
//     }
//   });
// };

const getDoctorById = async (req, res) => {
  const { doctorId } = req.body;
  try {
    if (doctorId) {
      let foundDoctor = await Doctor.findById({ _id: doctorId });
      console.log(foundDoctor, "found doctor");
      if (foundDoctor) {
        res.json({
          serverError: 0,
          message: "Doctor Found",
          data: {
            success: 1,
            foundDoctor: foundDoctor,
          },
        });
      } else {
        console.log(foundDoctor, "found");
        res.json({
          serverError: 0,
          message: "No Doctor Found",
          data: {
            success: 0,
            //foundDoctor: foundDoctor,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const updateDoctor = async (req, res) => {
  console.log(req.body, "req");
  let imageFiles = [];
  if (req?.files?.length > 0) {
    console.log(req.files, "here are the files");
    imageFiles = req.files.map((file) => file.path);
  }
  const {
    _id,
    firstName,
    lastName,
    email,
    phoneNumber,
    speciality,
    clinicName,
    image,
    password,
    emiratesId,
    role,
    gender,
    nationality,
    totalExperience,
    profile,
    certifications,
    education,
  } = req.body;
  if (
    _id &&
    firstName &&
    lastName &&
    email &&
    phoneNumber &&
    speciality &&
    role &&
    password
  ) {
    let hashedpassword;
    let hashedemiratesId;
    try {
      hashedpassword = await bcrypt.hash(password, 12);
      hashedemiratesId = CryptoJS.AES.encrypt(emiratesId, "love").toString();
      console.log(hashedemiratesId, "i am emirates");
    } catch (err) {
      console.log("Something went wrong while Encrypting Data", err);

      throw new Error("Something went wrong while Encrypting Data");
    }

    doctorSchema.findByIdAndUpdate(
      _id,
      {
        $set: {
          ...req.body,
          image:
            imageFiles.length > 0
              ? imageFiles.toString().replace(/\\/g, "/")
              : image,
          password: hashedpassword,
          uniqueId: password,
        },
      },
      (error, data) => {
        if (error) {
          return console.log(error);
        } else {
          console.log(data, "data");
          if (!data) {
            res.json({
              serverError: 0,
              message: "Not updated",
              success: 0,
            });
          } else {
            res.json({
              serverError: 0,
              message: "Doctor updated",
              success: 1,
            });
            return;
          }
        }
      }
    );
  } else {
    res.json({
      serverError: 0,
      msg: "Send all the data please",

      success: 1,
    });
    return;
  }
};

const deleteDoctor = async (req, res) => {
  const { doctorId } = req.body;
  try {
    if (doctorId) {
      let doctorFound = await Doctor.findByIdAndRemove({ _id: doctorId });
      if (doctorFound) {
        res.json({
          serverError: 0,
          message: "Doctor has been deleted successfully",
          data: {
            success: 1,
          },
        });
        return;
      } else {
        res.json({
          serverError: 1,
          message: "Error in deleting doctor",
          data: {
            success: 0,
          },
        });
      }
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};
//   doctorSchema.findByIdAndRemove(req.params.id, (error, data) => {
//     if (error) {
//       return next(error);
//     } else {
//       res.status(200).json({
//         serverError: 0,
//         msg: "Deleted successfully",
//         success: 1,
//       });
//     }
//   });
// };

const doctorLogin = async (req, res) => {
  const { phoneNumber, password, emiratesId, isPhoneNumber } = req.body;
  console.log(req.body);

  if (isPhoneNumber === "0") {
    try {
      let existingDoctor = await Doctor.findOne({ emiratesId: emiratesId });
      console.log(existingDoctor, "i am existing doctor");

      if (!existingDoctor) {
        res.json({
          serverError: 0,
          message: "We couldn't find record with this Emirates id",
          data: {
            success: 0,
            phoneVerified: 0,
            clinicVerified: 0,
            active: 0,
            activeRequested: 0,
            isExisting: 0,
          },
        });
        return;
      } else {
        let ValidPassword = false;
        try {
          ValidPassword = await bcrypt.compare(
            password,
            existingDoctor.password
          );
          console.log(ValidPassword, "in try");
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong");
        }
        console.log(ValidPassword, "valid pwd");
        if (existingDoctor && ValidPassword) {
          res.json({
            serverError: 0,
            success: 1,
            message: "Login succcessfully.",
            doctorFound: existingDoctor,
          });
        } else {
          res.json({
            serverError: 1,
            success: 0,
            message: "Invalid Credentails. Please try again",
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      let doctorFound = await Doctor.findOne({ phoneNumber: phoneNumber });
      console.log(doctorFound);
      let ValidPassword = false;
      if (!doctorFound) {
        res.json({
          serverError: 1,
          success: 0,
          message: "Invalid Login Credentails. Please try again",
        });
        return;
      } else {
        try {
          ValidPassword = await bcrypt.compare(password, doctorFound.password);
          console.log(ValidPassword, "in try");
        } catch (err) {
          console.log(err);
          // res.json({
          //   serverError: 1,
          //   success: 0,
          //   message: "Wrong Password",
          // });
        }

        let access_token;
        try {
          access_token = jwt.sign({ userId: doctorFound._id }, JWTKEY, {
            expiresIn: "1y",
          });
        } catch (err) {
          console.log(err);
          throw new Error("Something went wrong while creating token");
        }
        console.log(ValidPassword, "valid pwd");
        if (doctorFound && ValidPassword) {
          res.json({
            serverError: 0,
            success: 1,
            message: "Login succcessfully.",
            doctorFound: doctorFound,
            access_token: access_token,
          });
        }
      }
    } catch (err) {
      res.json({
        success: 0,
        serverError: 1,
        message: "Oops something went wrong. Please try again. ",
      });
    }
  }
};

const sendEmail = (email) => {
  console.log(email, "hello gggggg");
  if (email) {
    console.log("Things going good");
    const output = `
            
            <p>Your New Password</p>
            <p>Test@123</p>
            `;

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.google.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      service: "gmail",
      auth: {
        user: "appoloniaapp@gmail.com", // generated ethereal user
        pass: SMTPPASS, // generated ethereal password
      },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: '"Appolonia" <appoloniaapp@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "Password", // Subject line
      // text: details, // plain text body
      html: output, // html body
    };

    return transporter.sendMail(mailOptions);
  }
};

const forgotPassword = async (req, res) => {
  console.log(req.body);
  const { phoneNumber } = req.body;
  let doctorFound = await Doctor.findOne({ phoneNumber: phoneNumber });
  console.log(doctorFound, "in pwd");
  if (!doctorFound) {
    res.json({
      serverError: 0,
      message: "We couldn't find record with this mobile number.",
      data: {
        success: 0,
      },
    });
    return;
  } else {
    try {
      await sendEmail(doctorFound?.email);
    } catch (err) {
      console.log(err.message);
    }
    res.json({
      serverError: 0,
      message:
        "We have sent Password to your registered Email ID, please enter now to proceed.",
      data: {
        success: 1,
      },
    });
    return;
  }
};
const doctorScans = async (req, res) => {
  // const { doctorId } = req.body;
  //console.log(req.body);
  let foundScans = await Scans.find({ isOpen: "0" });
  let appointments = await Appointment.find({});
  console.log(appointments);
  console.log(foundScans, "found scans");
  if (foundScans) {
    res.json({
      serverError: 0,
      message: "Scans found",
      data: {
        success: 1,
        scans: foundScans,
        appointments: appointments,
      },
    });
  } else {
    res.json({
      serverError: 1,
      message: " No Scans or appointments found",
      data: {
        success: 0,
      },
    });
  }
};

const monthlySchedule = async (req, res) => {
  const { title, start, end, doctorId } = req.body;
  try {
    const doctorFound = await Doctor.find({ _id: doctorId });
    console.log(doctorFound);
    if ((title, start, end)) {
      const newEvent = await Event({
        title: title,
        start: start,
        end: end,
        doctorId: doctorId,
        doctorName: `${doctorFound[0]?.firstName} ${doctorFound[0]?.lastName}`,
      });
      newEvent.save(async (err, data) => {
        if (err) {
          console.log(err);
          throw new Error("Error saving the event");
        } else {
          console.log(data);

          res.json({
            serverError: 0,
            message: "New Event added.",
            data: {
              success: 1,
              event: data,
            },
          });
          return;
        }
      });
    } else {
      res.json({
        serverError: 0,
        message: "Something went wrong",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const allEvents = await Event.find({});
    console.log(allEvents);
    if (allEvents.length > 0) {
      res.json({
        serverError: 0,
        message: "Events found",
        data: {
          success: 1,
          events: allEvents,
        },
      });
      return;
    } else {
      res.json({
        serverError: 0,
        message: "No events found",
        data: {
          success: 0,
        },
      });
      return;
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const deleteEvent = async (req, res) => {
  const { eventId } = req.body;
  console.log(req.body);
  try {
    if (eventId) {
      const foundEvent = await Event.deleteOne({ _id: eventId });
      console.log(foundEvent);
      if (foundEvent) {
        res.json({
          serverError: 0,
          message: "Event deleted",
          data: {
            success: 1,
          },
        });
      } else {
        res.json({
          serverError: 0,
          message: "Event not found",
          data: {
            success: 1,
          },
        });
      }
    } else {
      res.json({
        serverError: 0,
        message: "Something went wrong",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};
const editEvent = async (req, res) => {
  const { eventId, title, start, end, doctorId } = req.body;
  try {
    const doctorFound = await Doctor.find({ _id: doctorId });
    console.log(doctorFound);
    const eventFound = await Event.find({ _id: eventId });
    console.log(eventFound);
    if (eventFound) {
      Event.updateMany(
        { _id: eventId },
        {
          $set: {
            ...req.body,
            doctorName: `${doctorFound[0]?.firstName} ${doctorFound[0]?.lastName}`,
          },
        },
        (error, data) => {
          if (error) {
            return console.log(error);
          } else {
            console.log(data, "data");
            if (!data) {
              res.json({
                serverError: 0,
                message: "Not updated",
                success: 0,
              });
            } else {
              res.json({
                serverError: 0,
                message: "Event updated",
                success: 1,
              });
              return;
            }
          }
        }
      );
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};
const getEventById = async (req, res) => {
  const { eventId } = req.body;
  try {
    const eventFound = await Event.find({ _id: eventId });
    console.log(eventFound);
    if (eventFound) {
      res.json({
        serverError: 0,
        message: "Event found.",
        data: {
          success: 1,
          event: eventFound,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "No Event found.",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const getDoctorsByTime = async (req, res) => {
  const { date, time } = req.body;
  const date1 = new Date(date);
  const time1 = new Date(time);
  console.log(date1, time1);
  try {
    if (date) {
      const foundTimes = await Event.find({ start: date });
      console.log(foundTimes);
      if (foundTimes) {
        res.json({
          serverError: 0,
          message: "Doctors found at requested date and time",
          data: {
            success: 1,
            foundTimes: foundTimes,
          },
        });
      } else {
        res.json({
          serverError: 0,
          message: "No Doctors found at requested date and time",
          data: {
            success: 0,
            event: eventFound,
          },
        });
      }
    } else {
      res.json({
        serverError: 1,
        message: "send all data",
        data: { success: 0 },
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};
module.exports = {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  doctorLogin,
  forgotPassword,
  doctorScans,
  monthlySchedule,
  getAllEvents,
  editEvent,
  deleteEvent,
  getEventById,
  getDoctorsByTime,
};
