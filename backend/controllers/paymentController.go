package controllers

import (
	"backend/models"
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type RazorpayOrderRequest struct {
	Amount         int    `json:"amount"` // in paise
	Currency       string `json:"currency"`
	Receipt        string `json:"receipt"`
	PaymentCapture int    `json:"payment_capture,omitempty"`
}

type RazorpayOrderResponse struct {
	ID        string `json:"id"`
	Entity    string `json:"entity"`
	Amount    int    `json:"amount"`
	Currency  string `json:"currency"`
	Receipt   string `json:"receipt"`
	Status    string `json:"status"`
	CreatedAt int64  `json:"created_at"`
}

func CreateRazorpayOrder(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	var input struct {
		Items []struct {
			ProductID string  `json:"productId"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"items"`
		ShippingAddress models.ShippingAddress `json:"shippingAddress"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid checkout information"})
		return
	}

	if len(input.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart cannot be empty"})
		return
	}

	if input.ShippingAddress.FullName == "" || input.ShippingAddress.Address == "" || input.ShippingAddress.City == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Full name, address, and city are required"})
		return
	}

	productColl := getCollection("products")
	var orderItems []models.OrderItem
	var total float64

	// Stock verification and preparation
	for _, item := range input.Items {
		var orderItem models.OrderItem
		objId, err := primitive.ObjectIDFromHex(item.ProductID)
		if err == nil {
			orderItem.ProductID = objId
			
			var product models.Product
			errFind := productColl.FindOne(context.TODO(), bson.M{"_id": objId}).Decode(&product)
			if errFind == nil {
				if product.StockQuantity < item.Quantity {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock for " + product.Name})
					return
				}
				// Decrement stock
				productColl.UpdateOne(
					context.TODO(),
					bson.M{"_id": product.ID},
					bson.M{"$inc": bson.M{"stockQuantity": -item.Quantity}},
				)
			}
		} else {
			orderItem.ProductID = primitive.NewObjectID()
		}

		orderItem.Quantity = item.Quantity
		orderItem.Price = item.Price
		orderItems = append(orderItems, orderItem)
		total += item.Price * float64(item.Quantity)
	}

	// Calculate tax and shipping cost natively in INR
	// We mimic Checkout.jsx's logic: Free shipping over ₹4000, 8% tax
	discountAmount := 0.0 // Discount can be handled on client side if applied
	netTotal := total - discountAmount
	shippingCost := 400.0 // Flat rate shipping for orders under ₹4000
	if netTotal > 4000.0 || netTotal == 0 {
		shippingCost = 0.0
	}
	tax := netTotal * 0.08
	finalTotal := netTotal + shippingCost + tax

	// Generate standard order record (inserted as pending)
	orderID := primitive.NewObjectID()
	order := models.Order{
		ID:              orderID,
		UserID:          userObjID,
		Items:           orderItems,
		Total:           finalTotal,
		ShippingAddress: input.ShippingAddress,
		PaymentMethod:   "Razorpay",
		Status:          "pending",
		CreatedAt:       time.Now(),
	}

	// Read API Credentials from Env
	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	isMock := keyID == "" || keySecret == ""

	// Amount in paise (1 INR = 100 paise)
	amountInPaise := int(finalTotal * 100)
	var rzpOrderID string

	if isMock {
		// Mock Mode fallback
		rzpOrderID = "rzp_mock_order_" + primitive.NewObjectID().Hex()[:12]
		order.RazorpayOrderID = rzpOrderID
		order.PaymentMethod = "Razorpay (Mock Test)"
		log.Println("[Payment] Razorpay credentials unconfigured. Defaulting to Mock Mode.")
	} else {
		// Real Razorpay API call
		rzpReq := RazorpayOrderRequest{
			Amount:   amountInPaise,
			Currency: "INR",
			Receipt:  orderID.Hex(),
		}

		jsonData, err := json.Marshal(rzpReq)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize payment data"})
			return
		}

		req, err := http.NewRequest("POST", "https://api.razorpay.com/v1/orders", bytes.NewBuffer(jsonData))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create payment API request"})
			return
		}

		req.Header.Set("Content-Type", "application/json")
		req.SetBasicAuth(keyID, keySecret)

		client := &http.Client{Timeout: 10 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Razorpay service unreachable"})
			return
		}
		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)
		if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
			log.Printf("[Payment] Razorpay API Error: %s", string(bodyBytes))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to initiate transaction with Razorpay gateway"})
			return
		}

		var rzpResp RazorpayOrderResponse
		if err := json.Unmarshal(bodyBytes, &rzpResp); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse payment gateway response"})
			return
		}

		rzpOrderID = rzpResp.ID
		order.RazorpayOrderID = rzpOrderID
	}

	// Insert order into DB
	orderColl := getCollection("orders")
	_, err := orderColl.InsertOne(context.TODO(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record order details in database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"orderId":          orderID.Hex(),
		"razorpayOrderId":  rzpOrderID,
		"amount":           amountInPaise,
		"keyId":            keyID,
		"currency":         "INR",
		"isMock":           isMock,
	})
}

func VerifyRazorpayPayment(c *gin.Context) {
	var input struct {
		OrderID           string `json:"orderId"`
		RazorpayOrderID   string `json:"razorpayOrderId"`
		RazorpayPaymentID string `json:"razorpayPaymentId"`
		RazorpaySignature string `json:"razorpaySignature"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification payload"})
		return
	}

	objID, err := primitive.ObjectIDFromHex(input.OrderID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order identifier"})
		return
	}

	keyID := os.Getenv("RAZORPAY_KEY_ID")
	keySecret := os.Getenv("RAZORPAY_KEY_SECRET")
	isMock := keyID == "" || keySecret == ""

	orderColl := getCollection("orders")

	if isMock {
		// Mock Mode auto-verifies
		update := bson.M{
			"$set": bson.M{
				"status":            "completed",
				"razorpayPaymentId": input.RazorpayPaymentID,
				"razorpaySignature": "mock_signature_verified",
			},
		}
		_, err = orderColl.UpdateOne(context.TODO(), bson.M{"_id": objID}, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete simulated payment"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Simulated sandbox transaction completed successfully",
		})
		return
	}

	// Real Signature Verification
	// Signature formula: HMAC-SHA256(razorpay_order_id + "|" + razorpay_payment_id, keySecret)
	data := input.RazorpayOrderID + "|" + input.RazorpayPaymentID
	h := hmac.New(sha256.New, []byte(keySecret))
	h.Write([]byte(data))
	expectedSignature := hex.EncodeToString(h.Sum(nil))

	if expectedSignature != input.RazorpaySignature {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Payment signature verification failed. Transaction rejected."})
		return
	}

	// Update order to completed and record details
	update := bson.M{
		"$set": bson.M{
			"status":            "completed",
			"razorpayPaymentId": input.RazorpayPaymentID,
			"razorpaySignature": input.RazorpaySignature,
		},
	}
	_, err = orderColl.UpdateOne(context.TODO(), bson.M{"_id": objID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order database payment record"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Transaction verified and order registered successfully",
	})
}
