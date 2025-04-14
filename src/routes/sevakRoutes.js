const express = require('express');
const router = express.Router();
const sevakController = require('../controllers/sevakController');
const authorizeRoles  = require('../middlewares/authMiddleware')
const upload = require('../middlewares/upload');

// Authentication Routes
router.post('/login', sevakController.login);
router.post('/register', authorizeRoles("superAdmin"),sevakController.createSevak);//create by superAdmin 
router.post('/updatePassword',authorizeRoles("superAdmin", "sevak","leader"), sevakController.updatePassword);
router.get('/dashboard',authorizeRoles("superAdmin"), sevakController.dashboard);
router.get('/profile', authorizeRoles("superAdmin","sevak","leader"),sevakController.profile);
router.post('/sevak/uploadCSV', authorizeRoles("superAdmin"),upload.single('csvfile'),sevakController.uploadCSV);
// CRUD Routes
router.get('/sevak/', authorizeRoles("superAdmin", "leader"),sevakController.getSevaks);
// router.get('/sevak/:id', authorizeRoles("superAdmin","sevak","leader"),sevakController.getSevakById);
router.put('/sevak/:id', authorizeRoles("superAdmin"),sevakController.updateSevak);
router.delete('/sevak/:id', authorizeRoles("superAdmin"),sevakController.deleteSevak);
router.post('/sevak/markAttendance', authorizeRoles("superAdmin"),sevakController.markAttendance);


module.exports = router;
