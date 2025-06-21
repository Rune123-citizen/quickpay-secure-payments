
package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/payflow/txn-svc/internal/config"
	"github.com/payflow/txn-svc/internal/database"
	"github.com/payflow/txn-svc/internal/handlers"
	"github.com/payflow/txn-svc/internal/kafka"
	"github.com/payflow/txn-svc/internal/middleware"
	"github.com/payflow/txn-svc/internal/services"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to initialize database:", err)
	}
	defer db.Close()

	// Initialize Kafka
	kafkaProducer, err := kafka.NewProducer(cfg.KafkaBroker)
	if err != nil {
		log.Fatal("Failed to initialize Kafka:", err)
	}
	defer kafkaProducer.Close()

	// Initialize services
	txnService := services.NewTransactionService(db, kafkaProducer)
	upiService := services.NewUPIService(cfg.UPIGatewayURL)

	// Initialize handlers
	txnHandler := handlers.NewTransactionHandler(txnService, upiService)

	// Setup router
	router := gin.Default()
	
	// Middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger())
	router.Use(middleware.Recovery())

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "transaction-service"})
	})

	// API routes
	api := router.Group("/api/v1")
	api.Use(middleware.JWTAuth())
	{
		api.POST("/transactions/upi-payment", txnHandler.InitiateUPIPayment)
		api.POST("/transactions/p2p-transfer", txnHandler.InitiateP2PTransfer)
		api.GET("/transactions", txnHandler.GetTransactions)
		api.GET("/transactions/:id", txnHandler.GetTransaction)
		api.POST("/transactions/:id/cancel", txnHandler.CancelTransaction)
		api.GET("/transactions/stats", txnHandler.GetTransactionStats)
	}

	// Webhook routes (no auth required)
	webhook := router.Group("/webhook")
	{
		webhook.POST("/upi-callback", txnHandler.HandleUPICallback)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Transaction Service starting on port %s", port)
	log.Fatal(router.Run(":" + port))
}
