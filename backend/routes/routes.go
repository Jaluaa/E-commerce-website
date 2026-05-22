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
	api.POST("/auth/verify", controllers.VerifyEmail)
	api.POST("/auth/resend-code", controllers.ResendCode)

	// Products
	api.GET("/products", controllers.GetProducts)
	api.GET("/products/:id", controllers.GetProduct)
	api.POST("/products", middleware.AuthRequired(), middleware.AdminRequired(), controllers.CreateProduct)
	api.PUT("/products/:id", middleware.AuthRequired(), middleware.AdminRequired(), controllers.UpdateProduct)
	api.DELETE("/products/:id", middleware.AuthRequired(), middleware.AdminRequired(), controllers.DeleteProduct)

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

	// Razorpay Payments (Protected)
	api.POST("/payment/razorpay/order", middleware.AuthRequired(), controllers.CreateRazorpayOrder)
	api.POST("/payment/razorpay/verify", middleware.AuthRequired(), controllers.VerifyRazorpayPayment)

	// Admin (Protected)
	api.GET("/admin/orders", middleware.AuthRequired(), middleware.AdminRequired(), controllers.GetAdminOrders)
	api.PUT("/admin/orders/:id/status", middleware.AuthRequired(), middleware.AdminRequired(), controllers.UpdateOrderStatus)
	api.GET("/admin/stats", middleware.AuthRequired(), middleware.AdminRequired(), controllers.GetAdminStats)
}
