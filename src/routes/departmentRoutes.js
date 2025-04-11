const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authorizeRoles = require('../middlewares/authMiddleware')

// CRUD Routes
router.post('/', authorizeRoles("superAdmin"),departmentController.createDepartment);
router.get('/', authorizeRoles("superAdmin"),departmentController.getDepartments);
router.get('/:id', authorizeRoles("superAdmin"),departmentController.getDepartmentById);//need to remove
router.put('/:id', authorizeRoles("superAdmin"),departmentController.updateDepartment);//need to remove
router.delete('/:id', authorizeRoles("superAdmin"),departmentController.deleteDepartment);//need to remove

module.exports = router;
