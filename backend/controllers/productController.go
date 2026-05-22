package controllers

import (
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func GetProducts(c *gin.Context) {
	collection := getCollection("products")
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
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

func GetProduct(c *gin.Context) {
	idParam := c.Param("id")
	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := getCollection("products")
	var product models.Product
	err = collection.FindOne(context.TODO(), bson.M{"_id": objId}).Decode(&product)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("products")
	res, err := collection.InsertOne(context.TODO(), product)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	product.ID = res.InsertedID.(primitive.ObjectID)
	c.JSON(http.StatusCreated, product)
}

func UpdateProduct(c *gin.Context) {
	idParam := c.Param("id")
	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	collection := getCollection("products")

	update := bson.M{
		"$set": bson.M{
			"name":          product.Name,
			"description":   product.Description,
			"price":         product.Price,
			"imageUrl":      product.ImageURL,
			"category":      product.Category,
			"stockQuantity": product.StockQuantity,
			"fandom":        product.Fandom,
			"rating":        product.Rating,
			"variants":      product.Variants,
		},
	}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": objId}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	product.ID = objId
	c.JSON(http.StatusOK, product)
}

func DeleteProduct(c *gin.Context) {
	idParam := c.Param("id")
	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	collection := getCollection("products")
	_, err = collection.DeleteOne(context.TODO(), bson.M{"_id": objId})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
