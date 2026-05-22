package controllers

import (
	"backend/models"
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetAdminStats(c *gin.Context) {
	// 1. Get Revenue & Order Count
	orderColl := getCollection("orders")
	cursor, err := orderColl.Find(context.TODO(), bson.M{})
	
	var totalRevenue float64
	var orderCount int
	
	if err == nil {
		defer cursor.Close(context.TODO())
		var orders []models.Order
		if err = cursor.All(context.TODO(), &orders); err == nil {
			orderCount = len(orders)
			for _, o := range orders {
				totalRevenue += o.Total
			}
		}
	}

	// 2. Get Products Count
	productColl := getCollection("products")
	productCount, _ := productColl.CountDocuments(context.TODO(), bson.M{})

	// 3. Get Users Count & Users List
	userColl := getCollection("users")
	userCount, _ := userColl.CountDocuments(context.TODO(), bson.M{})
	
	userCursor, errUsers := userColl.Find(context.TODO(), bson.M{})
	var usersList []gin.H
	if errUsers == nil {
		defer userCursor.Close(context.TODO())
		var users []models.User
		if err = userCursor.All(context.TODO(), &users); err == nil {
			for _, u := range users {
				usersList = append(usersList, gin.H{
					"id":          u.ID.Hex(),
					"email":       u.Email,
					"role":        u.Role,
					"is_verified": u.IsVerified,
				})
			}
		}
	}
	
	if usersList == nil {
		usersList = []gin.H{}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"totalRevenue":  totalRevenue,
			"totalOrders":   orderCount,
			"totalProducts": productCount,
			"totalUsers":    userCount,
		},
		"users": usersList,
	})
}
