const Sevak = require("../models/Sevak");
const SevakAttendance = require("../models/SevakAttendance");
const Department = require("../models/Department");
const fs = require("fs");
const csv = require("csv-parser");

const validateDepartments = async (departmentIds) => {
  const count = await Department.countDocuments({
    _id: { $in: departmentIds },
  });
  return count === departmentIds.length;
};

// Create Sevak
exports.createSevak = async (req, res) => {
  try {
    const { fullName, userName, mobile, departments, mandal, kshetra } =
      req.body;

    const existingSevak = await Sevak.findOne({
      userName: { $regex: `^${userName}$`, $options: "i" },
      isDeleted: false,
    });
    if (existingSevak) {
      return res.status(400).json({
        status: false,
        message: "Sevak with this Username already exists",
      });
    }

    // Validate department IDs
    if (!(await validateDepartments(departments))) {
      return res.status(400).json({ message: "Invalid department." });
    }

    const newSevak = new Sevak({
      fullName,
      userName,
      mobile,
      departments,
      mandal,
      kshetra,
    });
    const savedSevak = await newSevak.save();

    res.status(201).json({
      status: true,
      message: "Sevak Created Successfully",
      sevak: savedSevak,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Get All Sevaks
exports.getSevaks = async (req, res) => {
  try {
    const { search, kshetra, mandal } = req.query;

    let query = { isDeleted: false };

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
    console.log("query", query);
    const sevaks = await Sevak.find(query)
      .sort({ userName: 1 })
      .populate("departments", { name: 1 });
    res
      .status(200)
      .json({ status: true, message: "Sevaks Retrieved Successfully", sevaks });
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
      return res.status(404).json({ status: true, message: "Sevak not found" });
    }

    res.status(200).json({ sevak });
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
        .json({ status: false, message: "Invalid department ID(s)." });
    }

    const updatedSevak = await Sevak.findByIdAndUpdate(
      id,
      { fullName, userName, mobile, departments, mandal, kshetra },
      { new: true }
    ).populate("departments", { name: 1 });

    if (!updatedSevak || updatedSevak.isDeleted) {
      return res
        .status(404)
        .json({ status: false, message: "Sevak not found" });
    }

    res.status(200).json({
      status: true,
      message: "Sevak Updated Successfully",
      sevak: updatedSevak,
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
        .json({ status: false, message: "Sevak not found" });
    }

    res.status(200).json({
      status: true,
      message: "Sevak Deleted Successfully",
      sevak: deletedSevak,
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
        .json({ status: false, message: "Missing eventId or sevakId" });
    }
    const now = new Date();
    // const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS" format

    if (status === true) {
      // Check if attendance already exists
      const existing = await SevakAttendance.exists({ eventId, sevakId });

      if (existing) {
        return res.status(200).json({
          status: false,
          message: "Attendance already marked",
        });
      }

      const attendance = await SevakAttendance.create({
        eventId,
        sevakId,
        presentTime: currentTime,
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
        message: deleted ? "Attendance removed": "No attendance found to remove"});
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
