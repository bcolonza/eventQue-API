const express = require('express');
const  eventController = require('../controllers/eventController');
const authorizeRoles = require('../middlewares/authMiddleware')

const router = express.Router();

router.post('/', authorizeRoles("superAdmin"),eventController.createEvent);
router.get('/', authorizeRoles("superAdmin"),eventController.getEvents);
router.get('/:id', authorizeRoles("superAdmin"),eventController.getEventById);//need to remove 
router.put('/:id', authorizeRoles("superAdmin"),eventController.updateEvent);
router.delete('/:id', authorizeRoles("superAdmin"),eventController.deleteEvent);
router.get('/getEventDetail/:id', authorizeRoles("superAdmin"),eventController.getEventDetail);

module.exports = router;
