package controllers

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"context"
	"crypto/rand"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

func getCollection(collectionName string) *mongo.Collection {
	return config.DB.Collection(collectionName)
}

// generateOTP creates a secure 6-digit numeric OTP code.
func generateOTP() string {
	var table = [...]byte{'1', '2', '3', '4', '5', '6', '7', '8', '9', '0'}
	b := make([]byte, 6)
	n, err := io.ReadAtLeast(rand.Reader, b, 6)
	if n != 6 || err != nil {
		// Fallback to timestamp based randomness
		return fmt.Sprintf("%06d", time.Now().UnixNano()%1000000)
	}
	for i := 0; i < len(b); i++ {
		b[i] = table[int(b[i])%len(table)]
	}
	return string(b)
}

// generateJWTToken helper to sign standard authentication JWT tokens.
func generateJWTToken(user models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"role":    user.Role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	})

	secret := os.Getenv("JWT_SECRET")
	return token.SignedString([]byte(secret))
}

func Register(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("users")

	// Check if user exists
	var existing models.User
	err := collection.FindOne(context.TODO(), bson.M{"email": input.Email}).Decode(&existing)

	hashedPassword, errHash := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if errHash != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	otpCode := generateOTP()
	expiresTime := time.Now().Add(15 * time.Minute)

	if err == nil {
		// User exists
		if existing.IsVerified {
			c.JSON(http.StatusConflict, gin.H{"error": "User already exists and is verified"})
			return
		}

		// Overwrite unverified user to prevent signup locks
		update := bson.M{
			"$set": bson.M{
				"password":             string(hashedPassword),
				"verification_code":    otpCode,
				"verification_expires": expiresTime,
			},
		}
		_, errUpdate := collection.UpdateOne(context.TODO(), bson.M{"_id": existing.ID}, update)
		if errUpdate != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update signup details"})
			return
		}
	} else {
		// User does not exist, insert fresh
		newUser := models.User{
			Email:               input.Email,
			Password:            string(hashedPassword),
			Role:                "customer",
			IsVerified:          false,
			VerificationCode:    otpCode,
			VerificationExpires: expiresTime,
		}

		_, errInsert := collection.InsertOne(context.TODO(), newUser)
		if errInsert != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user account"})
			return
		}
	}

	// Dispatch email verification OTP
	errMail := utils.SendVerificationEmail(input.Email, otpCode)
	if errMail != nil {
		// Only fail if using a configured SMTP server
		if os.Getenv("SMTP_HOST") != "" {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to dispatch verification email"})
			return
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Verification code sent. Please verify your email to complete registration.",
		"email":   input.Email,
	})
}

func VerifyEmail(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("users")
	var user models.User

	err := collection.FindOne(context.TODO(), bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User account not found"})
		return
	}

	if user.IsVerified {
		// Already verified, generate token and proceed
		tokenString, errToken := generateJWTToken(user)
		if errToken != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate session token"})
			return
		}
		c.JSON(http.StatusOK, gin.H{
			"message": "Email is already verified",
			"token":   tokenString,
			"user": gin.H{
				"id":    user.ID,
				"email": user.Email,
				"role":  user.Role,
			},
		})
		return
	}

	// Validate code and check expiration
	if user.VerificationCode != input.Code {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid verification code"})
		return
	}

	if time.Now().After(user.VerificationExpires) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Verification code has expired"})
		return
	}

	// Activate user account
	update := bson.M{
		"$set": bson.M{
			"is_verified": true,
		},
		"$unset": bson.M{
			"verification_code":    "",
			"verification_expires": "",
		},
	}
	_, errUpdate := collection.UpdateOne(context.TODO(), bson.M{"_id": user.ID}, update)
	if errUpdate != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate user account"})
		return
	}

	// Automatically log the user in on successful verification
	user.IsVerified = true
	tokenString, errToken := generateJWTToken(user)
	if errToken != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate login token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email verified successfully!",
		"token":   tokenString,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

func ResendCode(c *gin.Context) {
	var input struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("users")
	var user models.User

	err := collection.FindOne(context.TODO(), bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User account not found"})
		return
	}

	if user.IsVerified {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already verified"})
		return
	}

	otpCode := generateOTP()
	expiresTime := time.Now().Add(15 * time.Minute)

	update := bson.M{
		"$set": bson.M{
			"verification_code":    otpCode,
			"verification_expires": expiresTime,
		},
	}
	_, errUpdate := collection.UpdateOne(context.TODO(), bson.M{"_id": user.ID}, update)
	if errUpdate != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate new code"})
		return
	}

	errMail := utils.SendVerificationEmail(user.Email, otpCode)
	if errMail != nil && os.Getenv("SMTP_HOST") != "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to dispatch verification email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "A fresh verification code has been dispatched to your email address.",
	})
}

func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("users")
	var user models.User

	err := collection.FindOne(context.TODO(), bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	// Verify email validation status
	if !user.IsVerified {
		c.JSON(http.StatusForbidden, gin.H{
			"error":      "Please verify your email address to unlock your account.",
			"unverified": true,
			"email":      user.Email,
		})
		return
	}

	tokenString, errToken := generateJWTToken(user)
	if errToken != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"role":  user.Role,
		},
	})
}

