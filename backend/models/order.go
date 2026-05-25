package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ShippingAddress struct {
	FullName string `bson:"fullName" json:"fullName"`
	Address  string `bson:"address" json:"address"`
	City     string `bson:"city" json:"city"`
	ZIP      string `bson:"zip" json:"zip"`
	Country  string `bson:"country" json:"country"`
	Phone    string `bson:"phone" json:"phone"`
}

type OrderItem struct {
	ProductID string  `bson:"productId" json:"productId"`
	Quantity  int     `bson:"quantity" json:"quantity"`
	Price     float64 `bson:"price" json:"price"` // price at the time of order
}

type Order struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID            primitive.ObjectID `bson:"userId" json:"userId"`
	Items             []OrderItem        `bson:"items" json:"items"`
	Total             float64            `bson:"total" json:"total"`
	ShippingAddress   ShippingAddress    `bson:"shippingAddress" json:"shippingAddress"`
	PaymentMethod     string             `bson:"paymentMethod" json:"paymentMethod"`
	Status            string             `bson:"status" json:"status"` // e.g. "pending", "completed"
	CreatedAt         time.Time          `bson:"createdAt" json:"createdAt"`
	RazorpayOrderID   string             `bson:"razorpayOrderId,omitempty" json:"razorpayOrderId,omitempty"`
	RazorpayPaymentID string             `bson:"razorpayPaymentId,omitempty" json:"razorpayPaymentId,omitempty"`
	RazorpaySignature string             `bson:"razorpaySignature,omitempty" json:"razorpaySignature,omitempty"`
}
