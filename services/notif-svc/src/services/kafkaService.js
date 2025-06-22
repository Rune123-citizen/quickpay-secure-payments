
const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');
const notificationController = require('../controllers/notificationController');

class KafkaService {
  constructor() {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
    });
    
    this.consumer = this.kafka.consumer({ groupId: 'notification-group' });
    this.producer = this.kafka.producer();
  }

  async initialize() {
    try {
      await this.consumer.connect();
      await this.producer.connect();
      
      // Subscribe to topics
      await this.consumer.subscribe({ topic: 'user-events' });
      await this.consumer.subscribe({ topic: 'transaction-events' });
      await this.consumer.subscribe({ topic: 'otp-requests' });
      
      // Start consuming messages
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const data = JSON.parse(message.value.toString());
            await this.handleMessage(topic, data);
          } catch (error) {
            logger.error(`Error processing message from topic ${topic}:`, error);
          }
        },
      });
      
      logger.info('Kafka service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Kafka service:', error);
      throw error;
    }
  }

  async handleMessage(topic, data) {
    logger.info(`Processing message from topic: ${topic}`, data);
    
    switch (topic) {
      case 'user-events':
        await this.handleUserEvent(data);
        break;
      case 'transaction-events':
        await this.handleTransactionEvent(data);
        break;
      case 'otp-requests':
        await this.handleOTPRequest(data);
        break;
      default:
        logger.warn(`Unknown topic: ${topic}`);
    }
  }

  async handleUserEvent(data) {
    const { eventType, userId, userData } = data;
    
    switch (eventType) {
      case 'USER_REGISTERED':
        if (userData.email) {
          await notificationController.sendWelcomeNotification(userId, userData);
        }
        break;
      case 'KYC_COMPLETED':
        await notificationController.sendKYCCompletionNotification(userId, userData);
        break;
      default:
        logger.info(`Unhandled user event: ${eventType}`);
    }
  }

  async handleTransactionEvent(data) {
    const { eventType, userId, transactionData } = data;
    
    switch (eventType) {
      case 'TRANSACTION_COMPLETED':
      case 'TRANSACTION_FAILED':
        await notificationController.sendTransactionNotification(userId, transactionData);
        break;
      case 'PAYMENT_RECEIVED':
        await notificationController.sendPaymentReceivedNotification(userId, transactionData);
        break;
      default:
        logger.info(`Unhandled transaction event: ${eventType}`);
    }
  }

  async handleOTPRequest(data) {
    const { phoneNumber, purpose, metadata } = data;
    await notificationController.generateAndSendOTP(phoneNumber, purpose, metadata);
  }

  async publishMessage(topic, message) {
    try {
      await this.producer.send({
        topic,
        messages: [{
          key: message.key || null,
          value: JSON.stringify(message.value)
        }]
      });
      
      logger.info(`Message published to topic: ${topic}`);
    } catch (error) {
      logger.error(`Failed to publish message to topic ${topic}:`, error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await this.consumer.disconnect();
      await this.producer.disconnect();
      logger.info('Kafka service disconnected');
    } catch (error) {
      logger.error('Error disconnecting from Kafka:', error);
    }
  }
}

module.exports = new KafkaService();
