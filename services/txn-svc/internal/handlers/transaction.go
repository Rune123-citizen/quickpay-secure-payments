
package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/payflow/txn-svc/internal/models"
	"github.com/payflow/txn-svc/internal/services"
)

type TransactionHandler struct {
	txnService *services.TransactionService
	upiService *services.UPIService
}

func NewTransactionHandler(txnService *services.TransactionService, upiService *services.UPIService) *TransactionHandler {
	return &TransactionHandler{
		txnService: txnService,
		upiService: upiService,
	}
}

func (h *TransactionHandler) InitiateUPIPayment(c *gin.Context) {
	userID := c.GetString("userId")
	
	var req models.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Type = models.TypeUPIPayment

	// Create transaction record
	txn, err := h.txnService.CreateTransaction(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	// Initiate UPI payment
	upiResp, err := h.upiService.InitiatePayment(req.Amount, req.VPA, req.Description, txn.ID)
	if err != nil {
		// Update transaction status to failed
		h.txnService.UpdateTransactionStatus(txn.ID, models.StatusFailed, err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to initiate UPI payment"})
		return
	}

	// Update transaction with UPI details
	// Note: In a production system, you'd want to update the transaction record with UPI transaction ID

	response := models.TransactionResponse{
		Transaction: txn,
		PaymentURL:  upiResp.PaymentURL,
		QRCode:      upiResp.QRCode,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *TransactionHandler) InitiateP2PTransfer(c *gin.Context) {
	userID := c.GetString("userId")
	
	var req models.TransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	req.Type = models.TypeP2PTransfer

	// Create transaction record
	txn, err := h.txnService.CreateTransaction(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	// For P2P transfers, we'd typically:
	// 1. Validate recipient exists
	// 2. Check sender balance
	// 3. Process the transfer
	// For now, we'll just mark it as successful immediately (demo purposes)
	h.txnService.UpdateTransactionStatus(txn.ID, models.StatusSuccess, "")

	response := models.TransactionResponse{
		Transaction: txn,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *TransactionHandler) GetTransactions(c *gin.Context) {
	userID := c.GetString("userId")
	
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	transactions, err := h.txnService.GetUserTransactions(userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch transactions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"transactions": transactions})
}

func (h *TransactionHandler) GetTransaction(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	txn, err := h.txnService.GetTransaction(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	c.JSON(http.StatusOK, txn)
}

func (h *TransactionHandler) CancelTransaction(c *gin.Context) {
	userID := c.GetString("userId")
	idStr := c.Param("id")
	
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid transaction ID"})
		return
	}

	if err := h.txnService.CancelTransaction(id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Transaction cancelled"})
}

func (h *TransactionHandler) GetTransactionStats(c *gin.Context) {
	userID := c.GetString("userId")
	
	stats, err := h.txnService.GetTransactionStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

func (h *TransactionHandler) HandleUPICallback(c *gin.Context) {
	var callback services.UPICallbackPayload
	if err := c.ShouldBindJSON(&callback); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Parse order ID to get transaction ID
	txnID, err := uuid.Parse(callback.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	// Update transaction status based on callback
	var status models.TransactionStatus
	var failureReason string

	switch callback.Status {
	case "SUCCESS":
		status = models.StatusSuccess
	case "FAILURE":
		status = models.StatusFailed
		failureReason = callback.Message
	default:
		status = models.StatusPending
	}

	if err := h.txnService.UpdateTransactionStatus(txnID, status, failureReason); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true})
}
