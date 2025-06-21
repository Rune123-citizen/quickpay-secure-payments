
package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
	"gorm.io/gorm"
)

type TransactionStatus string
type TransactionType string

const (
	StatusPending   TransactionStatus = "PENDING"
	StatusSuccess   TransactionStatus = "SUCCESS"
	StatusFailed    TransactionStatus = "FAILED"
	StatusCancelled TransactionStatus = "CANCELLED"

	TypeUPIPayment TransactionType = "UPI_PAYMENT"
	TypeP2PTransfer TransactionType = "P2P_TRANSFER"
	TypeTopUp      TransactionType = "TOP_UP"
	TypeWithdraw   TransactionType = "WITHDRAW"
)

type Transaction struct {
	ID              uuid.UUID         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID          string            `json:"userId" gorm:"not null;index"`
	Type            TransactionType   `json:"type" gorm:"not null"`
	Status          TransactionStatus `json:"status" gorm:"default:PENDING"`
	Amount          decimal.Decimal   `json:"amount" gorm:"type:decimal(15,2);not null"`
	Currency        string            `json:"currency" gorm:"default:INR"`
	Description     string            `json:"description"`
	
	// UPI specific fields
	UPITransactionID string `json:"upiTransactionId,omitempty" gorm:"index"`
	UPIReference     string `json:"upiReference,omitempty"`
	VPA              string `json:"vpa,omitempty"`
	
	// P2P specific fields
	ToUserID         string `json:"toUserId,omitempty" gorm:"index"`
	FromUserID       string `json:"fromUserId,omitempty" gorm:"index"`
	
	// Bank details (for withdrawals)
	BankAccount      string `json:"bankAccount,omitempty"`
	IFSC             string `json:"ifsc,omitempty"`
	
	// Timestamps and metadata
	InitiatedAt      time.Time `json:"initiatedAt"`
	CompletedAt      *time.Time `json:"completedAt,omitempty"`
	FailureReason    string    `json:"failureReason,omitempty"`
	Metadata         string    `json:"metadata,omitempty" gorm:"type:jsonb"`
	
	CreatedAt        time.Time `json:"createdAt"`
	UpdatedAt        time.Time `json:"updatedAt"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	t.InitiatedAt = time.Now()
	return nil
}

type TransactionRequest struct {
	Type        TransactionType `json:"type" binding:"required"`
	Amount      decimal.Decimal `json:"amount" binding:"required"`
	Description string          `json:"description"`
	
	// UPI specific
	VPA         string `json:"vpa,omitempty"`
	
	// P2P specific
	ToUserID    string `json:"toUserId,omitempty"`
	
	// Bank specific
	BankAccount string `json:"bankAccount,omitempty"`
	IFSC        string `json:"ifsc,omitempty"`
	
	Metadata    map[string]interface{} `json:"metadata,omitempty"`
}

type TransactionResponse struct {
	Transaction *Transaction `json:"transaction"`
	PaymentURL  string       `json:"paymentUrl,omitempty"`
	QRCode      string       `json:"qrCode,omitempty"`
}
