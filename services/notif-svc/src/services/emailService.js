
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, content, options = {}) {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@payflow.com',
        to,
        subject,
        html: content,
        ...options
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully to ${to}`, { messageId: result.messageId });
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendTransactionAlert(email, transactionData) {
    const { amount, type, status, timestamp, transactionId } = transactionData;
    
    const subject = `PayFlow Transaction ${status}`;
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Transaction Update</h2>
        <p>Your transaction has been ${status.toLowerCase()}.</p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h3>Transaction Details</h3>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Type:</strong> ${type}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><strong>Status:</strong> ${status}</p>
          <p><strong>Date:</strong> ${new Date(timestamp).toLocaleString()}</p>
        </div>
        
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>PayFlow Team</p>
      </div>
    `;
    
    return await this.sendEmail(email, subject, content);
  }

  async sendWelcomeEmail(email, userData) {
    const { name, phoneNumber } = userData;
    
    const subject = 'Welcome to PayFlow!';
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to PayFlow!</h1>
        <p>Hi ${name || 'there'},</p>
        
        <p>Thank you for joining PayFlow - your trusted digital payments partner.</p>
        
        <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Your Account Details</h3>
          <p><strong>Phone:</strong> ${phoneNumber}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <p>You can now:</p>
        <ul>
          <li>Send and receive money instantly</li>
          <li>Pay bills and recharge mobile</li>
          <li>Check your transaction history</li>
          <li>Manage your digital wallet</li>
        </ul>
        
        <p>Get started by downloading our mobile app or visiting our website.</p>
        
        <p>Best regards,<br>PayFlow Team</p>
      </div>
    `;
    
    return await this.sendEmail(email, subject, content);
  }
}

module.exports = new EmailService();
