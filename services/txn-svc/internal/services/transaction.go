
package services

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/payflow/txn-svc/internal/kafka"
	"github.com/payflow/txn-svc/internal/models"
	"gorm.io/gorm"
)

type TransactionService struct {
	db       *gorm.DB
	producer *kafka.Producer
}

func NewTransactionService(db *gorm.DB, producer *kafka.Producer) *TransactionService {
	return &TransactionService{
		db:       db,
		producer: producer,
	}
}

func (s *TransactionService) CreateTransaction(userID string, req *models.TransactionRequest) (*models.Transaction, error) {
	metadataJSON, _ := json.Marshal(req.Metadata)
	
	txn := &models.Transaction{
		UserID:      userID,
		Type:        req.Type,
		Amount:      req.Amount,
		Description: req.Description,
		VPA:         req.VPA,
		ToUserID:    req.ToUserID,
		BankAccount: req.BankAccount,
		IFSC:        req.IFSC,
		Metadata:    string(metadataJSON),
		Status:      models.StatusPending,
	}

	if err := s.db.Create(txn).Error; err != nil {
		return nil, err
	}

	// Publish transaction created event
	s.publishEvent("transaction.created", map[string]interface{}{
		"transactionId": txn.ID,
		"userId":        txn.UserID,
		"type":          txn.Type,
		"amount":        txn.Amount,
		"timestamp":     time.Now().Format(time.RFC3339),
	})

	return txn, nil
}

func (s *TransactionService) GetTransaction(id uuid.UUID) (*models.Transaction, error) {
	var txn models.Transaction
	if err := s.db.First(&txn, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &txn, nil
}

func (s *TransactionService) GetUserTransactions(userID string, limit, offset int) ([]models.Transaction, error) {
	var transactions []models.Transaction
	query := s.db.Where("user_id = ? OR to_user_id = ?", userID, userID).
		Order("created_at DESC")
	
	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&transactions).Error; err != nil {
		return nil, err
	}
	return transactions, nil
}

func (s *TransactionService) UpdateTransactionStatus(id uuid.UUID, status models.TransactionStatus, failureReason string) error {
	updates := map[string]interface{}{
		"status": status,
	}
	
	if status == models.StatusSuccess || status == models.StatusFailed {
		now := time.Now()
		updates["completed_at"] = &now
	}
	
	if failureReason != "" {
		updates["failure_reason"] = failureReason
	}

	if err := s.db.Model(&models.Transaction{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return err
	}

	// Publish status update event
	s.publishEvent("transaction.status.updated", map[string]interface{}{
		"transactionId":  id,
		"status":         status,
		"failureReason":  failureReason,
		"timestamp":      time.Now().Format(time.RFC3339),
	})

	return nil
}

func (s *TransactionService) CancelTransaction(id uuid.UUID, userID string) error {
	var txn models.Transaction
	if err := s.db.First(&txn, "id = ? AND user_id = ?", id, userID).Error; err != nil {
		return err
	}

	if txn.Status != models.StatusPending {
		return fmt.Errorf("cannot cancel transaction with status: %s", txn.Status)
	}

	return s.UpdateTransactionStatus(id, models.StatusCancelled, "Cancelled by user")
}

func (s *TransactionService) GetTransactionStats(userID string) (map[string]interface{}, error) {
	var stats struct {
		TotalTransactions int64           `json:"totalTransactions"`
		SuccessfulTxns   int64           `json:"successfulTransactions"`
		FailedTxns       int64           `json:"failedTransactions"`
		PendingTxns      int64           `json:"pendingTransactions"`
	}

	// Total transactions
	s.db.Model(&models.Transaction{}).Where("user_id = ?", userID).Count(&stats.TotalTransactions)
	
	// By status
	s.db.Model(&models.Transaction{}).Where("user_id = ? AND status = ?", userID, models.StatusSuccess).Count(&stats.SuccessfulTxns)
	s.db.Model(&models.Transaction{}).Where("user_id = ? AND status = ?", userID, models.StatusFailed).Count(&stats.FailedTxns)
	s.db.Model(&models.Transaction{}).Where("user_id = ? AND status = ?", userID, models.StatusPending).Count(&stats.PendingTxns)

	return map[string]interface{}{
		"totalTransactions":     stats.TotalTransactions,
		"successfulTransactions": stats.SuccessfulTxns,
		"failedTransactions":    stats.FailedTxns,
		"pendingTransactions":   stats.PendingTxns,
	}, nil
}

func (s *TransactionService) publishEvent(topic string, data map[string]interface{}) {
	if s.producer != nil {
		s.producer.PublishEvent(topic, data)
	}
}
