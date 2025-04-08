const express = require('express');
const { register, login ,updatePassword} = require('../controllers/authController');
const { isAdmin } = require('../middlewares/authMiddleware')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/updatePassword',isAdmin, updatePassword);

module.exports = router;
