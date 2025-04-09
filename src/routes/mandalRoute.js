const express = require('express');
const router = express.Router();
const mandalController = require('../controllers/mandalController');
const authorizeRoles = require('../middlewares/authMiddleware')

router.post('/', authorizeRoles("superAdmin"),mandalController.createMandal);//need to remove
router.get('/', authorizeRoles("superAdmin"),mandalController.getAllMandals);
router.put('/:id', authorizeRoles("superAdmin"), mandalController.updateMandal);//need to remove
router.delete('/:id', authorizeRoles("superAdmin"), mandalController.deleteMandal);//need to remove

module.exports = router;
