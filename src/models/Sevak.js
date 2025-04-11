const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const sevakSchema = new mongoose.Schema({
    fullName: { type: String, required: [true,"fullName is required"]},
    mobile: { type: String,required: [true,"mobile number is required"] },
    whatsappNumber: { type: String,default:null },
    email: { type: String },
    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
    mandal: { type: mongoose.Schema.Types.ObjectId, ref: 'Mandal',default: null },
    kshetra: { type: String,default: null },
    isDeleted: { type: Boolean, default: false },
    role: { type: String,enum:["superAdmin","admin","sevak","leader"], required: [true,"select role from sevak or leader "] },
    profilePic: { type: String, default: null },
    password: { type: String, required: [true, 'Password is required'] },
    isAdmin:{type: Boolean, default: false  },
    gender: { type: String, enum:["male","female"], required: [true,"select gender from male or female "] },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

sevakSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        return next(error);
    }
});

// Instance method to compare passwords
sevakSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};
module.exports = mongoose.model('Sevak', sevakSchema);
