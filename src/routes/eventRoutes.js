const express = require('express');
const  eventController = require('../controllers/eventController');
const { isAdmin } = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/', isAdmin,eventController.createEvent);
router.get('/', isAdmin,eventController.getEvents);
router.get('/:id', isAdmin,eventController.getEventById);
router.put('/:id', isAdmin,eventController.updateEvent);
router.delete('/:id', isAdmin,eventController.deleteEvent);

module.exports = router;
