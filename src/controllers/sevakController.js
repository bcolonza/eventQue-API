const Sevak = require("../models/Sevak");
const Event = require("../models/Event");
const SevakAttendance = require("../models/SevakAttendance");
const MasterEvent = require('../models/masterEvent');
const Mandal = require('../models/Mandal.js');
const Department = require("../models/Department");
const fs = require("fs");
const csv = require("csv-parser");
const generateToken = require('../utils/generateToken');
const { totalmem } = require("os");
const { convertTo24HourFormat,convertTo12HourFormat } = require("../utils/dateFormet.js");
const bcrypt = require('bcryptjs');

const validateDepartments = async (departmentIds) => {
  const count = await Department.countDocuments({
    _id: { $in: departmentIds },
  });
  return count === departmentIds.length;
};

// Create Sevak and leader
exports.createSevak = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      whatsappNumber,
      email,
      departments,
      mandal,
      kshetra,
      role,
      password,
      gender,
    } = req.body;

    const existingSevak = await Sevak.findOne({
      mobile: mobile,
      isDeleted: false,
    });
    if (existingSevak) {
      return res.status(400).json({
        status: false,
        message: "Sevak with this Mobile already exists",
        data: null,
      });
    }

    // Validate department IDs
    if(departments){
      if (!(await validateDepartments(departments))) {
        return res
          .status(400)
          .json({ status: false, message: "Invalid department.", data: null });
      }
    }

    const existMandal = await Mandal.findOne({name:mandal, isDeleted: false});

    if(!existMandal){
      return res
      .status(400)
      .json({ status: false, message: "Invalid mandal.", data: null });
    }
   
    const newSevak = new Sevak({
      fullName,
      mobile,
      whatsappNumber,
      email,
      departments,
      mandal:existMandal._id,
      kshetra,
      role,
      password,
      gender
    });
    const savedSevak = await newSevak.save();

    // Convert to plain object and remove password
    const sevakData = savedSevak.toObject();
    delete sevakData.password;

    res.status(200).json({
      status: true,
      message: "Sevak Created Successfully",
      data: sevakData,
    });
  } catch (error) {
    console.error("Sevak Creation Error:", error);
  
// Handle Mongoose validation errors
if (error.name === 'ValidationError') {
  const errors = Object.values(error.errors).map(err => err.message);

  return res.status(400).json({
    status: false,
    message: "Validation Error",
    errors, 
  });
}
  
    res.status(500).json({
      status: false,
      message: "Server Error",
      error: error.message || error,
    });
  }
};

exports.login = async (req, res) => {
  const { mobile, password } = req.body;
  try {
      const user = await Sevak.findOne({ mobile,isDeleted:false });
      if (!user) {
          return res.status(404).json({ status: false, message: 'User not found using this mobile number',data:null });
      }
      const isMatch = await user.comparePassword(password);
      if (isMatch) {
          const token = generateToken(user);
          const userObj = user.toObject();
          delete userObj.password;
          res.status(200).json({status:true, message: 'Login Successful', data:{user:userObj,token:token} });
      } else {
          res.status(401).json({ status: false, message: 'Wrong Password',data:null });
      }
  } catch (error) {
      res.status(500).json({ status: false, message: 'Server error', error });
  }
};

// admin dashboard
exports.dashboard = async (req, res) => {
  try {
    totalSevaks = await Sevak.countDocuments({ gender:"male",isDeleted: false });
    totalSevika = await Sevak.countDocuments({ gender:"female",isDeleted: false });
    totalGuest = 0;
    totalMasterEvent = await MasterEvent.countDocuments({ isDeleted: false });
    totalMsg = 0
    totalEvents = await Event.countDocuments({ isDeleted: false });
    totalDepartments = await Department.countDocuments();
    res.status(200).json({status:true, message: 'Login Successful', data:{totalSevaks:totalSevaks,totalSevika:totalSevika,totalGuest:totalGuest,totalEvents:totalEvents,totalMasterEvent:totalMasterEvent,totalDepartments:totalDepartments,totalMsg:totalMsg} });
  } catch (error) {
      res.status(500).json({ status: false, message: 'Server error', error });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user._id
    const {  oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: false,
        message: 'oldPassword and newPassword are required',
      });
    }

    const user = await Sevak.findById({ _id:userId });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(401).json({ status: false, message: 'Old password is incorrect'});
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ status: true, message: 'Password updated successfully'});

  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ status: false, message: 'Server error', error: error.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const userId = req.user._id
    const user = await Sevak.findOne({ _id:userId,isDeleted:false }).populate("departments", { name: 1 });

    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found',data:null });
    }

    const userObj = user.toObject();
    delete userObj.password;
    res.status(200).json({ status: true, message: "Get Sevak Detail", data: userObj });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Get All Sevaks 
exports.getSevaks = async (req, res) => {
  try {
  
    const userGender = req.user.gender
    const userRole = req.user.role

    const { search, kshetra, mandal } = req.query;

    let query = { isDeleted: false };

    //if not admin
    if (userRole !== "admin") {
      query.gender = userGender;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ fullName: regex }, { userName: regex }];
    }

    if (kshetra) {
      query.kshetra = kshetra;
    }

    if (mandal) {
      query.mandal = mandal;
    }
    const sevaks = await Sevak.find(query)
      .sort({ fullName: 1 }).select({__v:0,createdAt:0, updatedAt:0,isAdmin:0})
      // .populate("mandal", { name: 1 })
      .populate("departments", { name: 1 });
    res
      .status(200)
      .json({
        status: true,
        message: "Sevaks Retrieved Successfully",
        data: sevaks,
      });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};


// Update Sevak
exports.updateSevak = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, userName, mobile, departments, mandal, kshetra } =
      req.body;

    if (departments && !(await validateDepartments(departments))) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Invalid department ID(s).",
          data: null,
        });
    }

    const updatedSevak = await Sevak.findByIdAndUpdate(
      id,
      { fullName, userName, mobile, departments, mandal, kshetra },
      { new: true }
    ).populate("departments", { name: 1 });

    if (!updatedSevak || updatedSevak.isDeleted) {
      return res
        .status(404)
        .json({ status: false, message: "Sevak not found", data: null });
    }

    res.status(200).json({
      status: true,
      message: "Sevak Updated Successfully",
      data: updatedSevak,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Soft Delete Sevak
exports.deleteSevak = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSevak = await Sevak.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!deletedSevak) {
      return res
        .status(404)
        .json({ status: false, message: "Sevak not found", data: null });
    }

    res.status(200).json({
      status: true,
      message: "Sevak Deleted Successfully",
      data: deletedSevak,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { eventId, sevakId, status,isEdit,time } = req.body;

    if (!eventId || !sevakId) {
      return res
        .status(400)
        .json({
          status: false,
          message: "Missing eventId or sevakId",
          data: null,
        });
    }
    const now = new Date();
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);  // 24h format
    const convertCurrentTime = convertTo12HourFormat(currentTime) // 12h format

    if(isEdit && time){
      const convertUpdate12hTime = convertTo12HourFormat(time)
      const convertUpdate24Time = convertTo24HourFormat(time)

      // Update attendance
      const updated = await SevakAttendance.findOneAndUpdate(
        { eventId, sevakId },
        { presentTime: convertUpdate12hTime, convertedPresentTime: convertUpdate24Time },
        { new: true }
      );
      return res.status(200).json({
        status: true,
        message: "Attendance updated successfully",
        data: updated,
      });
    }
    if (status === true) {
      // Check if attendance already exists
      const existing = await SevakAttendance.exists({ eventId, sevakId });

      if (existing) {
        return res.status(200).json({
          status: false,
          message: "Attendance already marked",
          data: null,
        });
      }

      const attendance = await SevakAttendance.create({
        eventId,
        sevakId,
        presentTime: convertCurrentTime,//12h format
        convertedPresentTime:currentTime//24h format
      });

      return res.status(200).json({
        status: true,
        message: "Attendance marked successfully",
        data: attendance,
      });
    } else {
      // status is false — remove attendance
      const deleted = await SevakAttendance.findOneAndDelete({
        eventId,
        sevakId,
      });

      return res.status(200).json({
        status: true,
        message: deleted
          ? "Attendance removed"
          : "No attendance found to remove",
        data: null,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Could not mark attendance" });
  }
};

// upload csv
exports.uploadCSV = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const rawRows = [];

  // Step 1: Read all CSV rows first
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      rawRows.push(data);
    })
    .on("end", async () => {
      try {
        const results = [];

        for (const row of rawRows) {
          const { Name, Mobile, Mandal, Kshetra, gender, role, password } = row;

          // const existMandal = await Mandal.findOne({ name: Mandal, isDeleted: false });
          // if (!existMandal) continue; // Skip if mandal doesn't exist

          const hashedPassword = await bcrypt.hash(password || "default@123", 10);

          results.push({
            fullName: Name,
            mobile: Mobile,
            whatsappNumber: Mobile,
            email: "",
            mandal: Mandal,
            kshetra: Kshetra,
            gender: gender,
            role: role,
            password: hashedPassword,
          });
        }

        await Sevak.insertMany(results);
        fs.unlinkSync(req.file.path); // Clean up uploaded file

        res.status(200).json({ message: "CSV uploaded and data stored successfully." });
      } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ error: "Failed to insert data into MongoDB" });
      }
    });
};




  