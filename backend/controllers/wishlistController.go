package controllers

import (
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AddToWishlist(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	var req struct {
		ProductID string `json:"productId"`
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

	collection := getCollection("wishlists")

	// Find user wishlist or create it
	var wishlist models.Wishlist
	err = collection.FindOne(context.TODO(), bson.M{"userId": userObjID}).Decode(&wishlist)

	if err != nil { // Doesn't exist, create
		wishlist = models.Wishlist{
			UserID: userObjID,
			Items:  []primitive.ObjectID{productObjID},
		}
		_, err = collection.InsertOne(context.TODO(), wishlist)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create wishlist"})
			return
		}
	} else { // Exists, update if not already present
		exists := false
		for _, item := range wishlist.Items {
			if item == productObjID {
				exists = true
				break
			}
		}

		if !exists {
			_, err = collection.UpdateOne(
				context.TODO(),
				bson.M{"_id": wishlist.ID},
				bson.M{"$push": bson.M{"items": productObjID}},
			)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update wishlist"})
				return
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to wishlist"})
}

func GetWishlist(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	collection := getCollection("wishlists")
	var wishlist models.Wishlist
	err = collection.FindOne(context.TODO(), bson.M{"userId": userObjID}).Decode(&wishlist)
	if err != nil || len(wishlist.Items) == 0 {
		c.JSON(http.StatusOK, []models.Product{}) // Return empty array
		return
	}

	// Fetch full product objects for all IDs in the wishlist
	productColl := getCollection("products")
	cursor, err := productColl.Find(context.TODO(), bson.M{"_id": bson.M{"$in": wishlist.Items}})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load products"})
		return
	}
	defer cursor.Close(context.TODO())

	var products []models.Product
	if err = cursor.All(context.TODO(), &products); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode products"})
		return
	}

	if products == nil {
		products = []models.Product{}
	}

	c.JSON(http.StatusOK, products)
}

func RemoveFromWishlist(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	productIDHex := c.Param("productId")
	productObjID, err := primitive.ObjectIDFromHex(productIDHex)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := getCollection("wishlists")
	_, err = collection.UpdateOne(
		context.TODO(),
		bson.M{"userId": userObjID},
		bson.M{"$pull": bson.M{"items": productObjID}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item removed from wishlist"})
}
