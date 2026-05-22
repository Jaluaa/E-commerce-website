package main

import (
	"backend/config"
	"backend/models"
	"backend/routes"
	"context"
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"golang.org/x/crypto/bcrypt"
)

func seedDatabase() {
	userColl := config.DB.Collection("users")

	// Seed Admin User
	adminEmail := "admin@example.com"
	var existingAdmin models.User
	err := userColl.FindOne(context.TODO(), bson.M{"email": adminEmail}).Decode(&existingAdmin)
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	
	if err != nil { // Not found, seed
		admin := models.User{
			Email:      adminEmail,
			Password:   string(hashedPassword),
			Role:       "admin",
			IsVerified: true,
		}
		userColl.InsertOne(context.TODO(), admin)
		log.Println("Admin user seeded")
	} else {
		// Update existing admin to ensure they are verified and have the admin role
		update := bson.M{
			"$set": bson.M{
				"is_verified": true,
				"role":        "admin",
				"password":    string(hashedPassword),
			},
		}
		userColl.UpdateOne(context.TODO(), bson.M{"email": adminEmail}, update)
		log.Println("Admin user verified status and credentials enforced")
	}

	// Seed Products
	productColl := config.DB.Collection("products")
	count, _ := productColl.CountDocuments(context.TODO(), bson.M{})
	if count == 0 {
		products := []interface{}{
			models.Product{
				Name:          "Smartphone X",
				Description:   "Latest edge-to-edge display smartphone.",
				Price:         999.99,
				ImageURL:      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop",
				Category:      "Electronics",
				StockQuantity: 50,
			},
			models.Product{
				Name:          "Noise Cancelling Headphones",
				Description:   "Over-ear headphones with active noise cancellation.",
				Price:         299.99,
				ImageURL:      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
				Category:      "Electronics",
				StockQuantity: 100,
			},
			models.Product{
				Name:          "Classic Denim Jacket",
				Description:   "Vintage wash denim jacket for men.",
				Price:         89.99,
				ImageURL:      "https://images.unsplash.com/photo-1495105787522-5334e3fb0e6f?q=80&w=600&auto=format&fit=crop",
				Category:      "Fashion",
				StockQuantity: 40,
			},
			models.Product{
				Name:          "Women's Summer Dress",
				Description:   "Floral patterned lightweight summer dress.",
				Price:         59.99,
				ImageURL:      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=600&auto=format&fit=crop",
				Category:      "Fashion",
				StockQuantity: 60,
			},
			models.Product{
				Name:          "Leather Messenger Bag",
				Description:   "Genuine leather messenger bag with multiple compartments.",
				Price:         149.99,
				ImageURL:      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop",
				Category:      "Accessories",
				StockQuantity: 30,
			},
			models.Product{
				Name:          "Minimalist Watch",
				Description:   "Sleek minimalist watch with leather strap.",
				Price:         199.99,
				ImageURL:      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=600&auto=format&fit=crop",
				Category:      "Accessories",
				StockQuantity: 80,
			},
			models.Product{
				Name:          "Ceramic Coffee Mug",
				Description:   "Handcrafted oversized ceramic coffee mug.",
				Price:         24.99,
				ImageURL:      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop",
				Category:      "Home essentials",
				StockQuantity: 150,
			},
			models.Product{
				Name:          "Modern Table Lamp",
				Description:   "Sleek LED table lamp with adjustable brightness.",
				Price:         45.00,
				ImageURL:      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=600&auto=format&fit=crop",
				Category:      "Home essentials",
				StockQuantity: 70,
			},
		}
		productColl.InsertMany(context.TODO(), products)
		log.Println("Products seeded")
	}
}

func main() {
	config.LoadEnv()
	config.ConnectDatabase()

	seedDatabase()

	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.SetupRoutes(r)

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
