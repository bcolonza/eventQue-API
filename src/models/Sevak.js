const mongoose = require('mongoose');

const sevakSchema = new mongoose.Schema({
    // eventID:{  type:mongoose.Schema.Types.ObjectId,ref: 'Event',default: null},
    fullName: { type: String, },
    userName: { type: String, required: true },
    mobile: { type: String },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    mandal: { type: String },
    kshetra: { type: Number },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Sevak', sevakSchema);
