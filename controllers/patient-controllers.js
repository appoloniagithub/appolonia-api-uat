const User = require("../Models/User");
const Role = require("../Models/Role");
const File = require("../Models/File");
const Settings = require("../Models/Settings");
const Scans = require("../Models/Scans");
const Notes = require("../Models/Notes");
const Doctor = require("../Models/Doctor");

const getAllPatients = async (req, res) => {
  try {
    let allPatients = await User.find({ role: "1" });
    console.log(allPatients);
    let resObj = {};
    if (allPatients.length > 0) {
      res.json({
        serverError: 0,
        message: "Patients Found",
        data: {
          success: 1,
          allPatients: allPatients.reverse(),
        },
      });
      // resObj = {
      //   serverError: 0,
      //   message: "Patients Found",
      //   data: {
      //     success: 1,
      //     allPatients: allPatients.reverse(),
      //   },
      // };
    } else {
      res.json({
        serverError: 0,
        message: "Patients Not Found",
        data: {
          success: 0,
          //allPatients: allPatients,
        },
      });
      // resObj = {
      //   serverError: 0,
      //   message: "Patients Not Found",
      //   data: {
      //     success: 0,
      //     //allPatients: allPatients,
      //   },
      // };
    }
    //res.send(resObj);
    //console.log(resObj)
  } catch (err) {
    console.log(err);
    res.send({
      serverError: 1,
      message: err.message,
      data: { success: 0 },
    });
  }
};

const getPatientById = async (req, res) => {
  const { userId } = req.body;
  try {
    if (userId) {
      let foundPatient = await User.findById({ _id: userId });
      console.log(foundPatient);
      if (foundPatient)
        res.json({
          serverError: 0,
          message: "Patient Found",
          data: {
            success: 1,
            foundPatient: foundPatient,
          },
        });
    } else {
      res.json({
        serverError: 0,
        message: "Patient Not Found",
        data: {
          success: 0,
          //foundPatient: foundPatient,
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

const addPatientNotes = async (req, res) => {
  console.log(req.body);
  const { doctorId, userId, point } = req.body;

  try {
    let foundNotes = await Notes.findOne({
      userId: userId,
      doctorId: doctorId,
    });
    if (foundNotes) {
      console.log(foundNotes, "i am found notes");
      Notes.updateOne(
        { _id: foundNotes._id },
        { $push: { points: point } },
        (err) => {
          if (err) {
            console.log(err);
            throw new Error("Something went wrong while saving the Notes");
          } else {
            res.json({
              serverError: 0,
              message: "Note Added",
              data: {
                success: 1,
              },
            });
          }
        }
      );
    } else {
      console.log("i am new found notes");
      const createdNote = new Notes({
        userId,
        doctorId,
        points: [point],
      });
      createdNote.save((err) => {
        if (err) {
          console.log(err);
          throw new Error("Something went wrong while saving the Notes");
        } else {
          res.json({
            serverError: 0,
            message: "Note Created",
            data: {
              success: 1,
            },
          });
        }
      });
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

const getNotes = async (req, res) => {
  console.log(req.body);
  const { doctorId, userId } = req.body;

  try {
    let foundNotes = await Notes.findOne({
      userId: userId,
      doctorId: doctorId,
    });
    if (foundNotes) {
      console.log(foundNotes, "i am found notes");

      res.json({
        serverError: 0,
        message: "Note found",
        data: {
          success: 1,
          notes: foundNotes,
        },
      });
    } else {
      res.json({
        serverError: 0,
        message: "Note not found",
        data: {
          success: 0,
        },
      });
    }
  } catch (err) {
    res.json({
      serverError: 1,
      message: err.message,
      data: {
        success: 0,
      },
    });
  }
};

module.exports = {
  getAllPatients,
  addPatientNotes,
  getNotes,
  getPatientById,
};
