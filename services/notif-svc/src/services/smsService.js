
const twilio = require('twilio');
const logger = require('../utils/logger');

class SMSService {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
  }

  async sendSMS(to, message, options = {}) {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: to,
        ...options
      });

      logger.info(`SMS sent successfully to ${to}`, { messageId: result.sid });
      return {
        success: true,
        messageId: result.sid,
        status: result.status
      };
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
  }

  async sendOTP(phoneNumber, otp, purpose = 'LOGIN') {
    const templates = {
      LOGIN: `Your PayFlow login OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      REGISTRATION: `Welcome to PayFlow! Your verification OTP is ${otp}. Valid for 5 minutes.`,
      TRANSACTION: `Your PayFlow transaction OTP is ${otp}. Valid for 3 minutes.`,
      PASSWORD_RESET: `Your PayFlow password reset OTP is ${otp}. Valid for 5 minutes.`
    };

    const message = templates[purpose] || templates.LOGIN;
    return await this.sendSMS(phoneNumber, message);
  }

  async getMessageStatus(messageId) {
    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        dateUpdated: message.dateUpdated
      };
    } catch (error) {
      logger.error(`Failed to get message status for ${messageId}:`, error);
      throw error;
    }
  }
}

module.exports = new SMSService();
