package controllers

import (
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func Checkout(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	var input struct {
		Items []struct {
			ProductID string  `json:"productId"`
			Quantity  int     `json:"quantity"`
			Price     float64 `json:"price"`
		} `json:"items"`
		ShippingAddress models.ShippingAddress `json:"shippingAddress"`
		PaymentMethod   string                 `json:"paymentMethod"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipping or payment information"})
		return
	}

	if len(input.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order items cannot be empty"})
		return
	}

	if input.ShippingAddress.FullName == "" || input.ShippingAddress.Address == "" || input.ShippingAddress.City == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Full name, address, and city are required"})
		return
	}

	productColl := getCollection("products")
	var orderItems []models.OrderItem
	var total float64

	for _, item := range input.Items {
		var orderItem models.OrderItem
		orderItem.ProductID = item.ProductID
		
		// Optional: if ProductID is a valid hex ObjectID, check stock and reduce
		objId, err := primitive.ObjectIDFromHex(item.ProductID)
		if err == nil {
			var product models.Product
			errFind := productColl.FindOne(context.TODO(), bson.M{"_id": objId}).Decode(&product)
			if errFind == nil {
				if product.StockQuantity < item.Quantity {
					c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock for " + product.Name})
					return
				}
				productColl.UpdateOne(
					context.TODO(),
					bson.M{"_id": product.ID},
					bson.M{"$inc": bson.M{"stockQuantity": -item.Quantity}},
				)
			}
		}

		orderItem.Quantity = item.Quantity
		orderItem.Price = item.Price
		orderItems = append(orderItems, orderItem)
		total += item.Price * float64(item.Quantity)
	}

	order := models.Order{
		UserID:          userObjID,
		Items:           orderItems,
		Total:           total,
		ShippingAddress: input.ShippingAddress,
		PaymentMethod:   input.PaymentMethod,
		Status:          "pending",
		CreatedAt:       time.Now(),
	}

	orderColl := getCollection("orders")
	res, err := orderColl.InsertOne(context.TODO(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order placed successfully",
		"orderId": res.InsertedID.(primitive.ObjectID).Hex(),
	})
}

func GetOrders(c *gin.Context) {
	userIDStr := c.GetString("userID")
	userObjID, _ := primitive.ObjectIDFromHex(userIDStr)

	collection := getCollection("orders")
	cursor, err := collection.Find(context.TODO(), bson.M{"userId": userObjID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(context.TODO())

	var orders []models.Order
	if err = cursor.All(context.TODO(), &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	c.JSON(http.StatusOK, orders)
}

func GetAdminOrders(c *gin.Context) {
	collection := getCollection("orders")
	cursor, err := collection.Find(context.TODO(), bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}
	defer cursor.Close(context.TODO())

	var orders []models.Order
	if err = cursor.All(context.TODO(), &orders); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode orders"})
		return
	}

	if orders == nil {
		orders = []models.Order{}
	}

	c.JSON(http.StatusOK, orders)
}

func UpdateOrderStatus(c *gin.Context) {
	idParam := c.Param("id")
	objId, err := primitive.ObjectIDFromHex(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid order ID"})
		return
	}

	var input struct {
		Status string `json:"status"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status field"})
		return
	}

	collection := getCollection("orders")
	update := bson.M{"$set": bson.M{"status": input.Status}}

	_, err = collection.UpdateOne(context.TODO(), bson.M{"_id": objId}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order status updated successfully", "status": input.Status})
}
