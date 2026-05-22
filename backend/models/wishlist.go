package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Wishlist struct {
	ID     primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	UserID primitive.ObjectID   `bson:"userId" json:"userId"`
	Items  []primitive.ObjectID `bson:"items" json:"items"` // Array of product ObjectIDs
}
