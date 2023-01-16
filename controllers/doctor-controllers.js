const Doctor = require("../Models/Doctor");
const Role = require("../Models/Role");
const User = require("../Models/User");

let doctorSchema = require("../Models/Doctor");

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
    let foundDoctors = Doctor.find({ role: "Doctor" }, [
      "firstName",
      "lastName",
      "role",
      "speciality",
    ]);
    let foundAdmin = User.find({ role: "Admin" }, [
      "firstName",
      "lastName",
      "role",
      "speciality",
    ]);

    let [foundDoctorsResolved, foundAdminResolved] = await Promise.all([
      foundDoctors,
      foundAdmin,
    ]);
    console.log(foundAdminResolved, foundDoctorsResolved, "we are resolved");

    foundDoctors = [...foundAdminResolved, ...foundDoctorsResolved];
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
          doctors: doctors,
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
  }
};

const deleteDoctor = async (req, res) => {
  const { doctorId } = req.body;
  try {
    if (doctorId) {
      let foundDoctor = await Doctor.findByIdAndRemove({ _id: doctorId });
      console.log(foundDoctor, "found doctor");
      if (foundDoctor) {
        res.json({
          serverError: 0,
          message: "Doctor deleted successfully",
          data: {
            success: 1,
          },
        });
      } else {
        res.json({
          serverError: 0,
          message: "Error deleting the doctor",
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
module.exports = {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};
