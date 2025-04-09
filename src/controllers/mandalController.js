const Mandal = require('../models/Mandal');

// Create Mandal
exports.createMandal = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Mandal.findOne({ name, isDeleted: false });
    if (existing) {
      return res.status(400).json({ status: false, message: 'Mandal already exists' });
    }

    const mandal = await Mandal.create({ name });
    res.status(201).json({ status: true, message: 'Mandal created', data: mandal });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error', error });
  }
};

// Get All Mandals
exports.getAllMandals = async (req, res) => {
  try {
    const mandals = await Mandal.find({ isDeleted: false }).sort({ createdAt: -1 }).select({ name: 1 });
    res.status(200).json({ status: true, data: mandals });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error', error });
  }
};

// Update Mandal Name
exports.updateMandal = async (req, res) => {
  try {
    const { name } = req.body;
    const mandal = await Mandal.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

    if (!mandal || mandal.isDeleted) {
      return res.status(404).json({ status: false, message: 'Mandal not found' });
    }

    res.status(200).json({ status: true, message: 'Mandal updated', data: mandal });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error', error });
  }
};

// Soft Delete Mandal
exports.deleteMandal = async (req, res) => {
  try {
    const mandal = await Mandal.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });

    if (!mandal) {
      return res.status(404).json({ status: false, message: 'Mandal not found' });
    }

    res.status(200).json({ status: true, message: 'Mandal deleted' });
  } catch (error) {
    res.status(500).json({ status: false, message: 'Server error', error });
  }
};
