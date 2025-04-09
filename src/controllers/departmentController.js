const Department = require('../models/Department');

// Create Department
exports.createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        const existingDepartment = await Department.findOne({ name:{ $regex: `^${name}$`, $options: 'i' },isDeleted:false });
        if (existingDepartment) {
            return res.status(400).json({ status:false ,message: 'Department already exists',data:null });
        }

        const newDepartment = await Department.create({ name });
        res.status(200).json({ status:true ,message: 'Department Created Successfully', data: newDepartment });
    } catch (error) {
        res.status(500).json({ status:false,message: 'Server Error', error });
    }
};

// Get All Departments (Non-Deleted Only)
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ isDeleted: false }).sort({ createdAt: -1 }).select({name:1})
        res.status(200).json({ status:true,message: 'Departments Retrieved Successfully', data:departments });
    } catch (error) {
        res.status(500).json({ status:false,message: 'Server Error', error });
    }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const department = await Department.findById(id);

        if (!department || department.isDeleted) {
            return res.status(404).json({ status:false,message: 'Department not found',data:null });
        }

        res.status(200).json({ status:true,message:"Get Department Data",data:department });
    } catch (error) {
        res.status(500).json({ status:false ,message: 'Server Error', error });
    }
};

// Update Department
exports.updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const department = await Department.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!department || department.isDeleted) {
            return res.status(404).json({ status:false,message: 'Department not found',data:null });
        }

        res.status(200).json({ status:true,message: 'Department Updated Successfully', data:department });
    } catch (error) {
        res.status(500).json({ status:false,message: 'Server Error', error });
    }
};

// Soft Delete Department
exports.deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        const department = await Department.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        if (!department) {
            return res.status(404).json({ status:false,message: 'Department not found',data:null });
        }

        res.status(200).json({ status:true,message: 'Department Deleted Successfully', data:department });
    } catch (error) {
        res.status(500).json({ status:false,message: 'Server Error', error });
    }
};
