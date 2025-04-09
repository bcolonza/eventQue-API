const Sevak = require("../models/Sevak");
const Event = require("../models/Event");
const SevakAttendance = require("../models/SevakAttendance");
const Department = require("../models/Department");
const fs = require("fs");
const csv = require("csv-parser");
const generateToken = require('../utils/generateToken');
const { totalmem } = require("os");
const { convertTo24HourFormat,convertTo12HourFormat } = require("../utils/dateFormet.js");

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
      userName,
      mobile,
      departments,
      mandal,
      kshetra,
      role,
      password,
      gender,
    } = req.body;

    const existingSevak = await Sevak.findOne({
      userName: { $regex: `^${userName}$`, $options: "i" },
      isDeleted: false,
    });
    if (existingSevak) {
      return res.status(400).json({
        status: false,
        message: "Sevak with this Username already exists",
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

    const newSevak = new Sevak({
      fullName,
      userName,
      mobile,
      departments,
      mandal,
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
  const { userName, password } = req.body;
  try {
      const user = await Sevak.findOne({ userName });
      if (!user) {
          return res.status(404).json({ status: false, message: 'User not found',data:null });
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
    totalSevaks = await Sevak.countDocuments({ isDeleted: false });
    totalGuest = 0
    totalMasterEvent = 0
    totalMsg = 0
    totalEvents = await Event.countDocuments({ isDeleted: false });
    totalDepartments = await Department.countDocuments();
    res.status(200).json({status:true, message: 'Login Successful', data:{totalSevaks:totalSevaks,totalGuest:totalGuest,totalEvents:totalEvents,totalMasterEvent:totalMasterEvent,totalDepartments:totalDepartments,totalMsg:totalMsg} });
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
      .sort({ userName: 1 }).select({__v:0,createdAt:0, updatedAt:0,isAdmin:0})
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

// Get Sevak by ID
exports.getSevakById = async (req, res) => {
  try {
    const { id } = req.params;
    const sevak = await Sevak.findById(id).populate("departments", { name: 1 });

    if (!sevak || sevak.isDeleted) {
      return res
        .status(404)
        .json({ status: true, message: "Sevak not found", data: null });
    }

    res
      .status(200)
      .json({ status: true, message: "Get Sevak Detail", data: sevak });
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
    const { eventId, sevakId, status } = req.body;

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
    // const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);  // "HH:MM:SS" format
    const convertCurrentTime = convertTo12HourFormat(currentTime)





    
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
        presentTime: convertCurrentTime,
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

  const results = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (data) => {
      const { Name, Mobile, Mandal, Kshetra, "Full Name": FullName } = data;

      // Only push required fields
      results.push({
        fullName: FullName,
        userName: Name,
        mobile: Mobile,
        mandal: Mandal,
        kshetra: Kshetra,
      });
    })
    .on("end", async () => {
      try {
        const result = await Sevak.insertMany(results);
        fs.unlinkSync(req.file.path); // Clean up file
        res
          .status(200)
          .json({ message: "CSV uploaded and data stored successfully." });
      } catch (error) {
        res.status(500).json({ error: "Failed to insert data into MongoDB" });
      }
    });
};


  