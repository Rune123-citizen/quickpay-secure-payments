
const OTP = require('../models/OTP');
const smsService = require('../services/smsService');
const logger = require('../utils/logger');
const crypto = require('crypto');

class OTPController {
  generateOTP(length = 6) {
    return crypto.randomInt(100000, 999999).toString();
  }

  async sendOTP(req, res) {
    try {
      const { phoneNumber, purpose = 'LOGIN' } = req.body;
      
      // Check for recent OTP requests (rate limiting)
      const recentOTP = await OTP.findOne({
        phoneNumber,
        purpose,
        createdAt: { $gte: new Date(Date.now() - 60000) } // Last 1 minute
      });
      
      if (recentOTP) {
        return res.status(429).json({ 
          error: 'Please wait before requesting another OTP' 
        });
      }

      // Generate new OTP
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + (purpose === 'TRANSACTION' ? 3 * 60000 : 5 * 60000)); // 3 or 5 minutes
      
      const otp = new OTP({
        phoneNumber,
        otp: otpCode,
        purpose,
        expiresAt,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      await otp.save();
      
      // Send OTP via SMS
      const result = await smsService.sendOTP(phoneNumber, otpCode, purpose);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'OTP sent successfully',
          expiresIn: Math.floor((expiresAt - new Date()) / 1000)
        });
      } else {
        res.status(500).json({
          error: 'Failed to send OTP',
          details: result.error
        });
      }
    } catch (error) {
      logger.error('Error sending OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async verifyOTP(req, res) {
    try {
      const { phoneNumber, otp, purpose = 'LOGIN' } = req.body;
      
      // Find valid OTP
      const otpRecord = await OTP.findOne({
        phoneNumber,
        purpose,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (!otpRecord) {
        return res.status(400).json({ 
          error: 'Invalid or expired OTP' 
        });
      }
      
      // Check attempts
      if (otpRecord.attempts >= otpRecord.maxAttempts) {
        return res.status(400).json({ 
          error: 'Maximum OTP attempts exceeded' 
        });
      }
      
      // Verify OTP
      if (otpRecord.otp !== otp) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        
        return res.status(400).json({ 
          error: 'Invalid OTP',
          attemptsLeft: otpRecord.maxAttempts - otpRecord.attempts
        });
      }
      
      // Mark OTP as verified and used
      otpRecord.isVerified = true;
      otpRecord.isUsed = true;
      otpRecord.verifiedAt = new Date();
      await otpRecord.save();
      
      res.json({
        success: true,
        message: 'OTP verified successfully'
      });
    } catch (error) {
      logger.error('Error verifying OTP:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async generateAndSendOTP(phoneNumber, purpose, metadata = {}) {
    try {
      const otpCode = this.generateOTP();
      const expiresAt = new Date(Date.now() + (purpose === 'TRANSACTION' ? 3 * 60000 : 5 * 60000));
      
      const otp = new OTP({
        phoneNumber,
        otp: otpCode,
        purpose,
        expiresAt,
        metadata
      });
      
      await otp.save();
      
      // Send OTP via SMS
      const result = await smsService.sendOTP(phoneNumber, otpCode, purpose);
      
      if (result.success) {
        logger.info(`OTP sent successfully to ${phoneNumber} for ${purpose}`);
      } else {
        logger.error(`Failed to send OTP to ${phoneNumber}:`, result.error);
      }
      
      return result;
    } catch (error) {
      logger.error('Error generating and sending OTP:', error);
      throw error;
    }
  }

  async getOTPStatus(req, res) {
    try {
      const { phoneNumber, purpose } = req.query;
      
      const otp = await OTP.findOne({
        phoneNumber,
        purpose,
        expiresAt: { $gt: new Date() }
      }).sort({ createdAt: -1 });
      
      if (!otp) {
        return res.status(404).json({ error: 'No active OTP found' });
      }
      
      res.json({
        isActive: !otp.isUsed,
        expiresAt: otp.expiresAt,
        attempts: otp.attempts,
        maxAttempts: otp.maxAttempts,
        isVerified: otp.isVerified
      });
    } catch (error) {
      logger.error('Error getting OTP status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new OTPController();
