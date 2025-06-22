
const express = require('express');
const otpController = require('../controllers/otpController');
const { validateOTPRequest, validateOTPVerification } = require('../middleware/validation');

const router = express.Router();

// Send OTP
router.post('/send', validateOTPRequest, otpController.sendOTP);

// Verify OTP
router.post('/verify', validateOTPVerification, otpController.verifyOTP);

// Get OTP status
router.get('/status', otpController.getOTPStatus);

module.exports = router;
