
const express = require('express');
const notificationController = require('../controllers/notificationController');
const { validateNotification } = require('../middleware/validation');
const auth = require('../middleware/auth');

const router = express.Router();

// Send notification
router.post('/', auth, validateNotification, notificationController.sendNotification);

// Get user notifications
router.get('/user/:userId', auth, notificationController.getNotifications);

module.exports = router;
