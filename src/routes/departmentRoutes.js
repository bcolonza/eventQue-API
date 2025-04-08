const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { isAdmin } = require('../middlewares/authMiddleware')

// CRUD Routes
router.post('/', isAdmin,departmentController.createDepartment);
router.get('/', isAdmin,departmentController.getDepartments);
router.get('/:id', isAdmin,departmentController.getDepartmentById);
router.put('/:id', isAdmin,departmentController.updateDepartment);
router.delete('/:id', isAdmin,departmentController.deleteDepartment);

module.exports = router;
