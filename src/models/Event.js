const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref: 'User',default: null },
    parentEvent: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'MasterEvent', 
        default: null },
    title: { type: String, required: [true, 'Title is required'] },
    eventType: { type: String,enum:["Pooja", "Sabha", 'Gosthi','Meeting'], required: [true, 'Event type is required'] },
    date: { type: String, required: [true, 'Date is required'] },
    startTime: { type: String, required: [true, 'Start time is required'] },
    endTime: { type: String, required: [true, 'End time is required'] },
    isAllowGuestAttendance: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
