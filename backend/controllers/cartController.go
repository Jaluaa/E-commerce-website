package controllers

import (
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddToCart(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		ProductID string `json:"productId"`
		Quantity  int    `json:"quantity"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	productObjID, err := primitive.ObjectIDFromHex(req.ProductID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := getCollection("carts")
	
	// Find user cart
	var cart models.Cart
	err = collection.FindOne(context.TODO(), bson.M{"userId": userObjID}).Decode(&cart)
	
	if err != nil { // Cart doesn't exist, create it
		cart = models.Cart{
			UserID: userObjID,
			Items: []models.CartItem{
				{ProductID: productObjID, Quantity: req.Quantity},
			},
		}
		_, err = collection.InsertOne(context.TODO(), cart)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create cart"})
			return
		}
	} else { // Cart exists, update it
		itemExists := false
		for i, item := range cart.Items {
			if item.ProductID == productObjID {
				cart.Items[i].Quantity += req.Quantity
				itemExists = true
				break
			}
		}

		if !itemExists {
			cart.Items = append(cart.Items, models.CartItem{ProductID: productObjID, Quantity: req.Quantity})
		}

		_, err = collection.UpdateOne(
			context.TODO(),
			bson.M{"_id": cart.ID},
			bson.M{"$set": bson.M{"items": cart.Items}},
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
}

func GetCart(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := getCollection("carts")
	var cart models.Cart
	err = collection.FindOne(context.TODO(), bson.M{"userId": userObjID}).Decode(&cart)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"items": []models.CartItem{}}) // Return empty cart
		return
	}

	c.JSON(http.StatusOK, cart)
}

func RemoveFromCart(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	productIDHex := c.Param("productId")
	productObjID, err := primitive.ObjectIDFromHex(productIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := getCollection("carts")
	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"userId": userObjID},
		bson.M{"$pull": bson.M{"items": bson.M{"productId": productObjID}}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed"})
}
