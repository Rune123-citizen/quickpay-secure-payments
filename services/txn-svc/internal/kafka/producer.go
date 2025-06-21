
package kafka

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
)

type Producer struct {
	writer *kafka.Writer
}

func NewProducer(brokerURL string) (*Producer, error) {
	writer := &kafka.Writer{
		Addr:         kafka.TCP(brokerURL),
		Balancer:     &kafka.LeastBytes{},
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}

	return &Producer{writer: writer}, nil
}

func (p *Producer) PublishEvent(topic string, data map[string]interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return err
	}

	message := kafka.Message{
		Topic: topic,
		Value: jsonData,
		Time:  time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := p.writer.WriteMessages(ctx, message); err != nil {
		log.Printf("Failed to publish message to topic %s: %v", topic, err)
		return err
	}

	return nil
}

func (p *Producer) Close() error {
	return p.writer.Close()
}
