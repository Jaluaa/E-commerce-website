package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type OrderItem struct {
	ProductID primitive.ObjectID `bson:"productId" json:"productId"`
	Quantity  int                `bson:"quantity" json:"quantity"`
	Price     float64            `bson:"price" json:"price"` // price at the time of order
}

type Order struct {
	ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID     primitive.ObjectID `bson:"userId" json:"userId"`
	Items      []OrderItem        `bson:"items" json:"items"`
	Total      float64            `bson:"total" json:"total"`
	Status     string             `bson:"status" json:"status"` // e.g. "pending", "completed"
	CreatedAt  time.Time          `bson:"createdAt" json:"createdAt"`
}
