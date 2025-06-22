
const Joi = require('joi');

const validateNotification = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('SMS', 'EMAIL', 'PUSH', 'IN_APP').required(),
    channel: Joi.string().valid('OTP', 'TRANSACTION', 'MARKETING', 'SYSTEM').required(),
    recipient: Joi.string().required(),
    subject: Joi.string().optional(),
    content: Joi.string().required(),
    templateId: Joi.string().optional(),
    templateData: Joi.object().optional()
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

const validateOTPRequest = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
    purpose: Joi.string().valid('LOGIN', 'REGISTRATION', 'TRANSACTION', 'PASSWORD_RESET').default('LOGIN')
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

const validateOTPVerification = (req, res, next) => {
  const schema = Joi.object({
    phoneNumber: Joi.string().pattern(/^(\+91)?[6-9]\d{9}$/).required(),
    otp: Joi.string().length(6).pattern(/^\d+$/).required(),
    purpose: Joi.string().valid('LOGIN', 'REGISTRATION', 'TRANSACTION', 'PASSWORD_RESET').default('LOGIN')
  });
  
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateNotification,
  validateOTPRequest,
  validateOTPVerification
};
