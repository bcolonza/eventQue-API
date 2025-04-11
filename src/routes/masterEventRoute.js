const express = require('express');
const router = express.Router();
const masterEventController = require('../controllers/masterEventController');
const authorizeRoles = require('../middlewares/authMiddleware')

router.post('/', authorizeRoles("superAdmin"),masterEventController.createMasterEvent);
router.get('/', authorizeRoles("superAdmin"),masterEventController.getAllMasterEvents);
// router.get('/:id', masterEventController.getMasterEventById);//need to remove 
// router.put('/:id', masterEventController.updateMasterEvent);//need to remove
// router.delete('/:id', masterEventController.deleteMasterEvent);//need to remove

module.exports = router;
