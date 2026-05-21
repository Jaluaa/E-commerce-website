package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Product struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Name          string             `bson:"name" json:"name" validate:"required"`
	Description   string             `bson:"description" json:"description"`
	Price         float64            `bson:"price" json:"price" validate:"required"`
	ImageURL      string             `bson:"imageUrl" json:"imageUrl"`
	Category      string             `bson:"category" json:"category"`
	StockQuantity int                `bson:"stockQuantity" json:"stockQuantity"`
}
