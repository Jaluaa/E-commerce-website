package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")

	// Auth
	api.POST("/auth/register", controllers.Register)
	api.POST("/auth/login", controllers.Login)

	// Products
	api.GET("/products", controllers.GetProducts)
	api.GET("/products/:id", controllers.GetProduct)
	api.POST("/products", middleware.AuthRequired(), controllers.CreateProduct)

	// Cart (Protected)
	api.GET("/cart", middleware.AuthRequired(), controllers.GetCart)
	api.POST("/cart", middleware.AuthRequired(), controllers.AddToCart)
	api.DELETE("/cart/:productId", middleware.AuthRequired(), controllers.RemoveFromCart)

	// Wishlist (Protected)
	api.GET("/wishlist", middleware.AuthRequired(), controllers.GetWishlist)
	api.POST("/wishlist", middleware.AuthRequired(), controllers.AddToWishlist)
	api.DELETE("/wishlist/:productId", middleware.AuthRequired(), controllers.RemoveFromWishlist)

	// Orders (Protected)
	api.GET("/orders", middleware.AuthRequired(), controllers.GetOrders)
	api.POST("/orders/checkout", middleware.AuthRequired(), controllers.Checkout)
}
