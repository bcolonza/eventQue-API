const mongoose = require("mongoose");

const SevakAttendanceSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    sevakId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sevak",
      required: true,
    },
    presentTime: { type: String, required: [true, "present time is required"] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SevakAttendance", SevakAttendanceSchema);
