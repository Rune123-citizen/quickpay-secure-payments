
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/shopspring/decimal"
)

type UPIService struct {
	gatewayURL string
	client     *http.Client
}

type UPIPaymentRequest struct {
	Amount      decimal.Decimal `json:"amount"`
	VPA         string          `json:"vpa"`
	Description string          `json:"description"`
	CallbackURL string          `json:"callbackUrl"`
	OrderID     string          `json:"orderId"`
}

type UPIPaymentResponse struct {
	Success       bool   `json:"success"`
	TransactionID string `json:"transactionId"`
	PaymentURL    string `json:"paymentUrl"`
	QRCode        string `json:"qrCode"`
	Message       string `json:"message"`
}

type UPICallbackPayload struct {
	TransactionID string `json:"transactionId"`
	OrderID       string `json:"orderId"`
	Status        string `json:"status"`
	Amount        string `json:"amount"`
	UPIRef        string `json:"upiRef"`
	Message       string `json:"message"`
}

func NewUPIService(gatewayURL string) *UPIService {
	return &UPIService{
		gatewayURL: gatewayURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (u *UPIService) InitiatePayment(amount decimal.Decimal, vpa, description string, orderID uuid.UUID) (*UPIPaymentResponse, error) {
	payload := UPIPaymentRequest{
		Amount:      amount,
		VPA:         vpa,
		Description: description,
		CallbackURL: "http://localhost:8080/webhook/upi-callback",
		OrderID:     orderID.String(),
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	resp, err := u.client.Post(
		u.gatewayURL+"/upi/initiate",
		"application/json",
		bytes.NewBuffer(jsonData),
	)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var upiResp UPIPaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&upiResp); err != nil {
		return nil, err
	}

	if !upiResp.Success {
		return nil, fmt.Errorf("UPI payment initiation failed: %s", upiResp.Message)
	}

	return &upiResp, nil
}

func (u *UPIService) VerifyPayment(transactionID string) (*UPICallbackPayload, error) {
	resp, err := u.client.Get(u.gatewayURL + "/upi/verify/" + transactionID)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result UPICallbackPayload
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	return &result, nil
}
