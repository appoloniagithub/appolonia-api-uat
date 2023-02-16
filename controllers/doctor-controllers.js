const Doctor = require("../Models/Doctor");
const Role = require("../Models/Role");
const User = require("../Models/User");
var otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { JWTKEY, SMTPPASS, accountSid, authToken } = require("../Config/config");

let doctorSchema = require("../Models/Doctor");
const Scans = require("../Models/Scans");

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
      doctorSchema.create({ ...req.body, image: imageFiles }, (error, data) => {
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
      });
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

    let [foundDoctorsResolved] = await Promise.all([foundDoctors]);
    console.log(foundDoctorsResolved, "found doctors resolved");

    foundDoctors = [...foundDoctorsResolved];
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
    doctorSchema.findByIdAndUpdate(
      _id,
      {
        $set: { ...req.body, image: imageFiles },
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
        if (existingDoctor && existingDoctor.password == password) {
          res.json({
            serverError: 0,
            success: 1,
            message: "Login succcessfully.",
            existingDoctor: existingDoctor,
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
      if (doctorFound && doctorFound.password == password) {
        res.json({
          serverError: 0,
          success: 1,
          message: "Login succcessfully.",
          doctorFound: doctorFound,
        });
      } else {
        res.json({
          serverError: 1,
          success: 0,
          message: "Invalid Login Credentails. Please try again",
        });
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
  const { doctorId } = req.body;
  console.log(req.body);
  let foundScans = await Scans.find({ doctorId: doctorId });
  console.log(foundScans, "found scans");
  if (foundScans) {
    res.json({
      serverError: 0,
      message: "Scans found",
      data: {
        success: 1,
        scans: foundScans,
      },
    });
  } else {
    res.json({
      serverError: 1,
      message: " No Scans found",
      data: {
        success: 0,
      },
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
};
