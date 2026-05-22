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
		ShippingAddress models.ShippingAddress `json:"shippingAddress"`
		PaymentMethod   string                 `json:"paymentMethod"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid shipping or payment information"})
		return
	}

	if input.ShippingAddress.FullName == "" || input.ShippingAddress.Address == "" || input.ShippingAddress.City == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Full name, address, and city are required"})
		return
	}

	// Fetch user's cart
	cartColl := getCollection("carts")
	var cart models.Cart
	err := cartColl.FindOne(context.TODO(), bson.M{"userId": userObjID}).Decode(&cart)
	if err != nil || len(cart.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty or not found"})
		return
	}

	// Fetch products to calculate total and verify stock
	productColl := getCollection("products")
	var orderItems []models.OrderItem
	var total float64

	for _, item := range cart.Items {
		var product models.Product
		err = productColl.FindOne(context.TODO(), bson.M{"_id": item.ProductID}).Decode(&product)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found"})
			return
		}

		if product.StockQuantity < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock for " + product.Name})
			return
		}

		orderItem := models.OrderItem{
			ProductID: product.ID,
			Quantity:  item.Quantity,
			Price:     product.Price,
		}
		orderItems = append(orderItems, orderItem)
		total += product.Price * float64(item.Quantity)

		// Reduce stock
		productColl.UpdateOne(
			context.TODO(),
			bson.M{"_id": product.ID},
			bson.M{"$inc": bson.M{"stockQuantity": -item.Quantity}},
		)
	}

	order := models.Order{
		UserID:          userObjID,
		Items:           orderItems,
		Total:           total,
		ShippingAddress: input.ShippingAddress,
		PaymentMethod:   input.PaymentMethod,
		Status:          "completed",
		CreatedAt:       time.Now(),
	}

	orderColl := getCollection("orders")
	_, err = orderColl.InsertOne(context.TODO(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Clear cart
	cartColl.DeleteOne(context.TODO(), bson.M{"userId": userObjID})

	c.JSON(http.StatusCreated, gin.H{"message": "Order placed successfully"})
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
