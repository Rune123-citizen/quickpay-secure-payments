
package config

import "os"

type Config struct {
	DatabaseURL   string
	KafkaBroker   string
	UPIGatewayURL string
	JWTSecret     string
	VaultAddr     string
	VaultToken    string
}

func Load() *Config {
	return &Config{
		DatabaseURL:   getEnv("DATABASE_URL", "postgres://payflow_user:payflow_pass@localhost:5432/payflow_db?sslmode=disable"),
		KafkaBroker:   getEnv("KAFKA_BROKER", "localhost:9092"),
		UPIGatewayURL: getEnv("UPI_GATEWAY_URL", "http://localhost:8090"),
		JWTSecret:     getEnv("JWT_SECRET", "dev-secret"),
		VaultAddr:     getEnv("VAULT_ADDR", "http://localhost:8200"),
		VaultToken:    getEnv("VAULT_TOKEN", "payflow-dev-token"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
