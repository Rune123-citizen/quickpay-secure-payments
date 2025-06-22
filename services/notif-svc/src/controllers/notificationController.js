
const Notification = require('../models/Notification');
const smsService = require('../services/smsService');
const emailService = require('../services/emailService');
const logger = require('../utils/logger');

class NotificationController {
  async sendNotification(req, res) {
    try {
      const { userId, type, channel, recipient, content, templateId, templateData } = req.body;
      
      const notification = new Notification({
        userId,
        type,
        channel,
        recipient,
        content,
        templateId,
        templateData
      });
      
      await notification.save();
      
      // Send notification based on type
      const result = await this.processNotification(notification);
      
      // Update notification status
      notification.status = result.success ? 'SENT' : 'FAILED';
      notification.providerMessageId = result.messageId;
      notification.sentAt = new Date();
      if (!result.success) {
        notification.failureReason = result.error;
      }
      
      await notification.save();
      
      res.json({
        success: true,
        notificationId: notification._id,
        status: notification.status
      });
    } catch (error) {
      logger.error('Error sending notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  }

  async processNotification(notification) {
    try {
      switch (notification.type) {
        case 'SMS':
          return await smsService.sendSMS(notification.recipient, notification.content);
        case 'EMAIL':
          return await emailService.sendEmail(
            notification.recipient,
            notification.subject || 'PayFlow Notification',
            notification.content
          );
        default:
          return { success: false, error: 'Unsupported notification type' };
      }
    } catch (error) {
      logger.error('Error processing notification:', error);
      return { success: false, error: error.message };
    }
  }

  async getNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20, type, status } = req.query;
      
      const filter = { userId };
      if (type) filter.type = type;
      if (status) filter.status = status;
      
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .select('-content'); // Exclude content for list view
      
      const total = await Notification.countDocuments(filter);
      
      res.json({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }

  async sendWelcomeNotification(userId, userData) {
    try {
      if (userData.email) {
        const result = await emailService.sendWelcomeEmail(userData.email, userData);
        
        const notification = new Notification({
          userId,
          type: 'EMAIL',
          channel: 'SYSTEM',
          recipient: userData.email,
          subject: 'Welcome to PayFlow!',
          content: 'Welcome email sent',
          status: result.success ? 'SENT' : 'FAILED',
          providerMessageId: result.messageId,
          sentAt: new Date(),
          failureReason: result.success ? null : result.error
        });
        
        await notification.save();
      }
    } catch (error) {
      logger.error('Error sending welcome notification:', error);
    }
  }

  async sendTransactionNotification(userId, transactionData) {
    try {
      // Send SMS notification
      const smsContent = `PayFlow: Your ${transactionData.type} of ₹${transactionData.amount} has been ${transactionData.status}. Txn ID: ${transactionData.transactionId}`;
      
      const smsResult = await smsService.sendSMS(transactionData.phoneNumber, smsContent);
      
      const smsNotification = new Notification({
        userId,
        type: 'SMS',
        channel: 'TRANSACTION',
        recipient: transactionData.phoneNumber,
        content: smsContent,
        status: smsResult.success ? 'SENT' : 'FAILED',
        providerMessageId: smsResult.messageId,
        sentAt: new Date(),
        failureReason: smsResult.success ? null : smsResult.error
      });
      
      await smsNotification.save();
      
      // Send email notification if email is available
      if (transactionData.email) {
        const emailResult = await emailService.sendTransactionAlert(transactionData.email, transactionData);
        
        const emailNotification = new Notification({
          userId,
          type: 'EMAIL',
          channel: 'TRANSACTION',
          recipient: transactionData.email,
          subject: `PayFlow Transaction ${transactionData.status}`,
          content: 'Transaction alert email sent',
          status: emailResult.success ? 'SENT' : 'FAILED',
          providerMessageId: emailResult.messageId,
          sentAt: new Date(),
          failureReason: emailResult.success ? null : emailResult.error
        });
        
        await emailNotification.save();
      }
    } catch (error) {
      logger.error('Error sending transaction notification:', error);
    }
  }

  async sendKYCCompletionNotification(userId, userData) {
    try {
      const smsContent = `PayFlow: Your KYC verification has been completed successfully. You can now enjoy full access to all PayFlow services.`;
      
      const result = await smsService.sendSMS(userData.phoneNumber, smsContent);
      
      const notification = new Notification({
        userId,
        type: 'SMS',
        channel: 'SYSTEM',
        recipient: userData.phoneNumber,
        content: smsContent,
        status: result.success ? 'SENT' : 'FAILED',
        providerMessageId: result.messageId,
        sentAt: new Date(),
        failureReason: result.success ? null : result.error
      });
      
      await notification.save();
    } catch (error) {
      logger.error('Error sending KYC completion notification:', error);
    }
  }

  async sendPaymentReceivedNotification(userId, transactionData) {
    try {
      const smsContent = `PayFlow: You have received ₹${transactionData.amount} from ${transactionData.senderName || 'Unknown'}. Balance: ₹${transactionData.newBalance}`;
      
      const result = await smsService.sendSMS(transactionData.phoneNumber, smsContent);
      
      const notification = new Notification({
        userId,
        type: 'SMS',
        channel: 'TRANSACTION',
        recipient: transactionData.phoneNumber,
        content: smsContent,
        status: result.success ? 'SENT' : 'FAILED',
        providerMessageId: result.messageId,
        sentAt: new Date(),
        failureReason: result.success ? null : result.error
      });
      
      await notification.save();
    } catch (error) {
      logger.error('Error sending payment received notification:', error);
    }
  }
}

module.exports = new NotificationController();
