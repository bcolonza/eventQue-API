const express = require('express');
const router = express.Router();
const sevakController = require('../controllers/sevakController');
const { isAdmin } = require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload');

// CRUD Routes
router.post('/', isAdmin,sevakController.createSevak);
router.get('/', isAdmin,sevakController.getSevaks);
router.get('/:id', isAdmin,sevakController.getSevakById);
router.put('/:id', isAdmin,sevakController.updateSevak);
router.delete('/:id', isAdmin,sevakController.deleteSevak);
router.post('/uploadCSV', isAdmin,upload.single('csvfile'),sevakController.uploadCSV);
router.post('/markAttendance', isAdmin,sevakController.markAttendance);

module.exports = router;
