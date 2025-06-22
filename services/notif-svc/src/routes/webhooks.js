
const express = require('express');
const Notification = require('../models/Notification');
const logger = require('../utils/logger');

const router = express.Router();

// Twilio SMS webhook
router.post('/twilio/sms-status', async (req, res) => {
  try {
    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;
    
    const notification = await Notification.findOne({ 
      providerMessageId: MessageSid 
    });
    
    if (notification) {
      notification.status = mapTwilioStatus(MessageStatus);
      if (ErrorCode) {
        notification.failureReason = `${ErrorCode}: ${ErrorMessage}`;
      }
      if (MessageStatus === 'delivered') {
        notification.deliveredAt = new Date();
      }
      
      await notification.save();
      logger.info(`Updated notification status: ${MessageSid} -> ${MessageStatus}`);
    }
    
    res.status(200).send('OK');
  } catch (error) {
    logger.error('Error processing Twilio webhook:', error);
    res.status(500).send('Error');
  }
});

// Email webhook (generic)
router.post('/email-status', async (req, res) => {
  try {
    const { messageId, status, timestamp } = req.body;
    
    const notification = await Notification.findOne({ 
      providerMessageId: messageId 
    });
    
    if (notification) {
      notification.status = status.toUpperCase();
      if (status === 'delivered') {
        notification.deliveredAt = new Date(timestamp);
      }
      
      await notification.save();
      logger.info(`Updated email notification status: ${messageId} -> ${status}`);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('Error processing email webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function mapTwilioStatus(twilioStatus) {
  const statusMap = {
    'queued': 'PENDING',
    'sent': 'SENT',
    'delivered': 'DELIVERED',
    'failed': 'FAILED',
    'undelivered': 'FAILED'
  };
  
  return statusMap[twilioStatus] || 'PENDING';
}

module.exports = router;
