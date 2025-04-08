const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: [true,"Name is required"] },
    isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
