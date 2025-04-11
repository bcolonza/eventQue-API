const MasterEvent = require('../models/masterEvent');

// Create
exports.createMasterEvent = async (req, res) => {
  try {
    const {masterEventName,startDate}= req.body
    const event = new MasterEvent({masterEventName,startDate});
    const savedEvent = await event.save();
    res.status(200).json({status:true,message:"Event Created Successfully",data:savedEvent});
  } catch (error) {
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
      
        return res.status(400).json({
          status: false,
          message: "Validation Error",
          errors, 
        });
      }
      res.status(500).json({ status: false, message: "Server Error", error });
    }
};

// Read All
exports.getAllMasterEvents = async (req, res) => {
  try {
    const events = await MasterEvent.find({isDeleted:false}).sort({ startDate: -1 });
    res.status(200).json({status:true,message:"Event List",data:events});
  } catch (error) {
    res.status(500).json({ status: false, message: "Server Error", error });
  }
};

// Read One
exports.getMasterEventById = async (req, res) => {
  try {
    const event = await MasterEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update
exports.updateMasterEvent = async (req, res) => {
  try {
    const updated = await MasterEvent.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: 'Event not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete
exports.deleteMasterEvent = async (req, res) => {
  try {
    const deleted = await MasterEvent.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
