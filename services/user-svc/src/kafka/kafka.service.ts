
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer, Consumer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'user-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });

    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: 'user-service-group' });

    await this.producer.connect();
    await this.consumer.connect();

    // Subscribe to relevant topics
    await this.consumer.subscribe({ topics: ['auth.user.created'] });

    console.log('Kafka connected for User Service');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.consumer.disconnect();
  }

  async publish(topic: string, message: any): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
  }

  async subscribe(topic: string, callback: (message: any) => void): Promise<void> {
    await this.consumer.subscribe({ topics: [topic] });
    
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const parsedMessage = JSON.parse(message.value?.toString() || '{}');
        callback(parsedMessage);
      },
    });
  }
}
