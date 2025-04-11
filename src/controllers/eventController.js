const Event = require("../models/Event");
const Sevak = require("../models/Sevak");
const { convertTo24HourFormat,convertTo12HourFormat } = require("../utils/dateFormet.js");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Create Event

exports.createEvent = async (req, res) => {
  try {
    const { parentEvent, title, eventType, date, startTime, endTime,isAllowGuestAttendance } =
      req.body;

    // const existingEvent = await Event.findOne({
    //   title: { $regex: `^${title}$`, $options: "i" },
    //   isDeleted: false,
    // });

    // if (existingEvent) {
    //   return res
    //     .status(400)
    //     .json({ status: false, message: "Event already exists", data: null });
    // }
    // createdBy
    const newEvent = await Event.create({
      parentEvent,
      title,
      eventType,
      date,
      startTime,
      endTime,
      createdBy: req.user._id,
      isAllowGuestAttendance:isAllowGuestAttendance
    });
    res.status(200).json({
      status: true,
      message: "Event Added Successfully",
      data: newEvent,
    });
  } catch (error) {
    // Handle Mongoose validation errors
if (error.name === 'ValidationError') {
  const errors = Object.values(error.errors).map(err => err.message);

  return res.status(400).json({
    status: false,
    message: "Validation Error",
    errors, 
  });
}
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Get Events with Filters
exports.getEvents = async (req, res) => {
  try {
    const { filterEventType, search,filterParentEvent } = req.query; 

    let query = { isDeleted: false };

    //date filter
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    // filter

    // if (filter === "Completed") {
    //   query = { ...query, date: { $lt: currentDate } }; // Events before today
    // } else if (filter === "Upcoming") {
    //   query = { date: { $gt: currentDate } }; // Events after today
    // } else if (filter === "Ongoing") {
    //   query = { date: currentDate }; // Events happening today
    // }

    // search
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      query = {
        ...query,
        $or: [{ title: { $regex: searchRegex } }],
      };
    }

    if (filterEventType) {
      query = {
        ...query,
        eventType: filterEventType ,
      };
    }

    if (filterParentEvent) {
      query = {
        ...query,
        parentEvent:new ObjectId(filterParentEvent) ,
      };
    }
    console.log(query);
    const events = await Event.find(query).populate("parentEvent", { masterEventName: 1 }).sort({ date: -1 }).select({__v:0,createdAt:0,updatedAt:0});

     // Add status to each event
     const enrichedEvents = events.map(event => {
      let status = "Upcoming";
      if (event.date < currentDate) status = "Completed";
      else if (event.date === currentDate) status = "Ongoing";
    
      return {
        ...event._doc, // Spread original event
        status,
      };
    });
    
    res.status(200).json({
      status: true,
      message: "Event List Get Successfully",
      data: enrichedEvents,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Get Single Event
exports.getEventById = async (req, res) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS" format

    const event = await Event.findById(req.params.id).select({
      title: 1,
      eventType: 1,
      date: 1,
      startTime: 1,
      endTime: 1,
    });
    if (!event)
      return res
        .status(404)
        .json({ status: false, message: "Event not found", data: null });

    // Determine event status
    let eventStatus = "";
    if (event.date === currentDate) {
      eventStatus = "Ongoing";
    } else if (event.date > currentDate) {
      eventStatus = "Upcoming";
    } else {
      eventStatus = "Completed";
    }

    res.status(200).json({
      status: true,
      message: "Get Event Data",
      data: {
        event: event,
        eventStatus: eventStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Update Event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!event)
      return res
        .status(404)
        .json({ status: false, message: "Event not found", data: null });
    res.status(200).json({
      status: true,
      message: "Event Updated Successfully",
      data: event,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });
    if (!event)
      return res
        .status(404)
        .json({ status: false, message: "Event not found", data: null });
    res
      .status(200)
      .json({
        status: true,
        message: "Event deleted successfully",
        data: null,
      });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

//event detail with sevak list
exports.getEventDetail = async (req, res) => {
  try {
    const { filterByAttendance, filterDepartment, filterKshetra,filterMandal,search } = req.query;
    
    const userGender = req.user.gender
    const userRole = req.user.role

    let query = { isDeleted: false };

    //if not admin
    if (userRole !== "superAdmin") {
      query.gender = userGender;
    }

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ fullName: regex }];
    }

    if (filterKshetra) {
      query.kshetra = filterKshetra;
    }

    if (filterMandal) {
      query.mandal = new ObjectId(filterMandal);
    }
    if (filterDepartment) {
      query.departments = new ObjectId(filterDepartment);
    }

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().split(" ")[0]; // "HH:MM:SS" format

    const event = await Event.findById(req.params.id).select({
      title: 1,
      eventType: 1,
      date: 1,
      startTime: 1,
      endTime: 1,
    });

    if (!event) {
      return res
        .status(404)
        .json({ status: false, message: "Event not found", data: null });
    }

    // Determine event status
    let eventStatus = "";
    if (event.date == currentDate) {
      eventStatus = "Ongoing";
    } else if (event.date > currentDate) {
      eventStatus = "Upcoming";
    } else {
      eventStatus = "Completed";
    }

    const eventStartTime = convertTo24HourFormat(event.startTime)
    const sevak = await Sevak.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "sevakattendances",
          localField: "_id",
          foreignField: "sevakId",
          pipeline: [
            {
              $match: { eventId: event._id },
            },
            {
              $project: { presentTime: 1,convertedPresentTime:1 },
            },
          ],
          as: "sevakAttendances",
        },
      },
      {
        $lookup: {
          from: "mandals",
          localField: "mandal",
          foreignField: "_id",
          pipeline: [
            {
              $match: { isDeleted: false },
            },
            {
              $project: { name: 1 },
            },
          ],
          as: "mandalsData",
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          mobile:1,
          whatsappNumber:1,
          mandal: { $arrayElemAt: ["$mandalsData.name", 0] },
          kshetra:1,
          departments:1,
          profilePic:"https://images.pexels.com/photos/736230/pexels-photo-736230.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          presentTime: {
            $ifNull: [
              { $arrayElemAt: ["$sevakAttendances.presentTime", 0] },
              "00:00",
            ],
          },
          color: {
            $cond: {
              if: { $gt: [{ $size: "$sevakAttendances" }, 0] },
              then: {
                $cond: {
                  if: {
                    $gt: [
                      { $arrayElemAt: ["$sevakAttendances.convertedPresentTime", 0] },
                      eventStartTime,
                    ],
                  },
                  then: "CFA01F",
                  else: "008000",
                },
              },
              else: "D61818",
            },
          },
          presentStatus: {
            $cond: {
              if: { $gt: [{ $size: "$sevakAttendances" }, 0] },
              then: true,
              else: false,
            },
          },
          presentData: {
            $cond: {
              if: { $gt: [{ $size: "$sevakAttendances" }, 0] },
              then: "Present",
              else: "Absent",
            },
          },
          attendance: {
            $cond: {
              if: { $gt: [{ $size: "$sevakAttendances" }, 0] },
              then: {
                $cond: {
                  if: {
                    $gt: [
                      { $arrayElemAt: ["$sevakAttendances.convertedPresentTime", 0] },
                      eventStartTime,
                    ],
                  },
                  then: "Late",
                  else: "On Time",
                },
              },
              else: "Absent",
            },
          },
        },
      },
      ...(filterByAttendance
        ? [
            {
              $match: {
                presentData: filterByAttendance,
              },
            },
          ]
        : []),
    ]);

    // Count summary
    let totalSevaks = sevak.length;
    let totalOnTime = 0;
    let totalLate = 0;
    let totalAbsent = 0;

    sevak.forEach((s) => {
      if (s.attendance === "On Time") totalOnTime++;
      else if (s.attendance === "Late") totalLate++;
      else if (s.attendance === "Absent") totalAbsent++;
    });

    const percentage = (count) =>
      totalSevaks > 0 ? ((count / totalSevaks) * 100).toFixed(2) : 0;

    if (!event)
      return res
        .status(404)
        .json({ status: false, message: "Event not found" });
    res.status(200).json({
      status: true,
      message: "Get Event Data",
      data: {
        eventStatus:eventStatus,
        event: event,
        sevak: sevak,
        graphData: [
          { label: "On Time", total: totalOnTime, backgroundColor: "008000" },
          { label: "Late", total: totalLate, backgroundColor: "CFA01F" },
          { label: "Absent", total: totalAbsent, backgroundColor: "D61818" },
        ],
        summary: {
          totalSevaks,
          totalOnTime:totalOnTime,
          totalLate:totalLate,
          totalAbsent:totalAbsent,
          percentageOnTime: percentage(totalOnTime),
          percentageLate: percentage(totalLate),
          percentageAbsent: percentage(totalAbsent),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};
