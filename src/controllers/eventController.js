const Event = require('../models/Event');
const moment = require('moment-timezone');

// Create Event
exports.createEvent = async (req, res) => {
    try {
        const { parentEvent, title, eventType, date, startTime, endTime } = req.body;
        
        const existingEvent = await Event.findOne({ title: { $regex: `^${title}$`, $options: 'i' } ,isDeleted:false});

        if (existingEvent) {
            return res.status(400).json({ status:false,message: 'Event already exists' });
        }
        // createdBy
        const newEvent = await Event.create({ parentEvent, title, eventType, date, startTime, endTime,createdBy:req.user._id });
        res.status(201).json({status:true , message:"Event Added Successfully",newEvent:newEvent});
    } catch (error) {
        res.status(500).json({ status: false, message: 'Server Error', error });
    }
};

// Get Events with Filters
exports.getEvents = async (req, res) => {
    try {
        const { filter,search  } = req.query; // filter: 'past', 'upcoming', 'ongoing'

        const now = new Date();
        const currentDate = now.toISOString().split('T')[0]; 

        console.log("currentDate",currentDate)

        // filter
        let query = {isDeleted:false};

        if (filter === 'past') {
            query = { ...query,date: { $lt: currentDate } }; // Events before today
        } else if (filter === 'upcoming') {
            query = { date: { $gt: currentDate } }; // Events after today
        } else if (filter === 'ongoing') {
            query = { date: currentDate }; // Events happening today
        }

         // search 
         if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
            query = {
                ...query,
                $or: [
                    { title: { $regex: searchRegex } },
                ]
            };
        }
        const events = await Event.find(query).sort({ createdAt: -1 })
        // .populate('parentEvent');
        res.status(200).json({status:true, message:"Event List Get Successfully", events:events});
    } catch (error) {
        res.status(500).json({status:false, message: 'Server Error', error });
    }
};

// Get Single Event
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
        // .populate('parentEvent');
        if (!event) return res.status(404).json({ status:false, message: 'Event not found' });
        res.status(200).json({status:true, message:"Get Event Data",event:event});
    } catch (error) {
        res.status(500).json({ status:false, message: 'Server Error', error });
    }
};

// Update Event
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) return res.status(404).json({ status:false, message: 'Event not found' });
        res.status(200).json({status:true, message:"Event Updated Successfully",event:event});
    } catch (error) {
        res.status(500).json({ status:false, message: 'Server Error', error });
    }
};

// Delete Event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id,{isDeleted:true});
        if (!event) return res.status(404).json({ status:false, message: 'Event not found' });
        res.status(200).json({ status:true, message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ status:false, message: 'Server Error', error });
    }
};
