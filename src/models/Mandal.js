const mongoose = require('mongoose');

const mandalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mandal name is required'],
      unique: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mandal', mandalSchema);
