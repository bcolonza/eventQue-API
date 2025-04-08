const Event = require("../models/Event");
const Sevak = require("../models/Sevak");
const moment = require("moment-timezone");

// Create Event
exports.createEvent = async (req, res) => {
  try {
    const { parentEvent, title, eventType, date, startTime, endTime } =
      req.body;

    const existingEvent = await Event.findOne({
      title: { $regex: `^${title}$`, $options: "i" },
      isDeleted: false,
    });

    if (existingEvent) {
      return res
        .status(400)
        .json({ status: false, message: "Event already exists" });
    }
    // createdBy
    const newEvent = await Event.create({
      parentEvent,
      title,
      eventType,
      date,
      startTime,
      endTime,
      createdBy: req.user._id,
    });
    res.status(201).json({
      status: true,
      message: "Event Added Successfully",
      newEvent: newEvent,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Get Events with Filters
exports.getEvents = async (req, res) => {
  try {
    const { filter, search } = req.query; // filter: 'past', 'upcoming', 'ongoing'

    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];

    console.log("currentDate", currentDate);

    // filter
    let query = { isDeleted: false };

    if (filter === "past") {
      query = { ...query, date: { $lt: currentDate } }; // Events before today
    } else if (filter === "upcoming") {
      query = { date: { $gt: currentDate } }; // Events after today
    } else if (filter === "ongoing") {
      query = { date: currentDate }; // Events happening today
    }

    // search
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      query = {
        ...query,
        $or: [{ title: { $regex: searchRegex } }],
      };
    }
    const events = await Event.find(query).sort({ createdAt: -1 });
    // .populate('parentEvent');
    res.status(200).json({
      status: true,
      message: "Event List Get Successfully",
      events: events,
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
        .json({ status: false, message: "Event not found" });

    // Determine event status
    let eventStatus = "";
    if (event.date === currentDate) {
      eventStatus = "Ongoing";
    } else if (event.date > currentDate) {
      eventStatus = "Upcoming";
    } else {
      eventStatus = "Past";
    }

    res.status(200).json({
      status: true,
      message: "Get Event Data",
      event: event,
      eventStatus:eventStatus
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
        .json({ status: false, message: "Event not found" });
    res.status(200).json({
      status: true,
      message: "Event Updated Successfully",
      event: event,
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
        .json({ status: false, message: "Event not found" });
    res
      .status(200)
      .json({ status: true, message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

//event detail with sevak list
exports.getEventDetail = async (req, res) => {
  try {
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
        .json({ status: false, message: "Event not found" });
    }

    const sevak = await Sevak.aggregate([
      {
        $match: { isDeleted: false },
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
              $project: { presentTime: 1 },
            },
          ],
          as: "sevakAttendances",
        },
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          userName: 1,
          presentTime: { $arrayElemAt: ["$sevakAttendances.presentTime", 0] },
          attendance: {
            $cond: {
              if: { $gt: [{ $size: "$sevakAttendances" }, 0] },
              then: {
                $cond: {
                  if: {
                    $gt: [
                      { $arrayElemAt: ["$sevakAttendances.presentTime", 0] },
                      event.startTime,
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
      event: event,
      sevak: sevak,
      summary: {
        totalSevaks,
        percentageOnTime: percentage(totalOnTime),
        percentageLate: percentage(totalLate),
        percentageAbsent: percentage(totalAbsent),
      },
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};
