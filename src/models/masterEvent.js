const mongoose = require('mongoose');

const masterEventSchema = new mongoose.Schema({
  masterEventName: {
    type: String,
    required: [true, 'Master event name is required'],
    trim: true
  },
  startDate: {
    type: String,
    required: [true, 'Date is required']
  },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('MasterEvent', masterEventSchema);
