package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                  primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email               string             `bson:"email" json:"email"`
	Password            string             `bson:"password" json:"-"`
	Role                string             `bson:"role" json:"role"` // "admin" or "customer"
	IsVerified          bool               `bson:"is_verified" json:"is_verified"`
	VerificationCode    string             `bson:"verification_code,omitempty" json:"-"`
	VerificationExpires time.Time          `bson:"verification_expires,omitempty" json:"-"`
}
