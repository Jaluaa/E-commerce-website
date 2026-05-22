package main

import (
	"backend/config"
	"backend/models"
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	config.LoadEnv()
	config.ConnectDatabase()

	fmt.Println("\n================ MONGO DIAGNOSTICS ================")

	// 1. Check wishlists collection
	wishlistColl := config.DB.Collection("wishlists")
	cursor, err := wishlistColl.Find(context.TODO(), bson.M{})
	if err != nil {
		log.Fatal("Failed to query wishlists:", err)
	}
	defer cursor.Close(context.TODO())

	var wishlists []models.Wishlist
	if err = cursor.All(context.TODO(), &wishlists); err != nil {
		log.Fatal("Failed to decode wishlists:", err)
	}

	fmt.Printf("Total wishlists in database: %d\n", len(wishlists))
	for i, wl := range wishlists {
		fmt.Printf("Wishlist [%d]:\n", i)
		fmt.Printf("  - Document ID: %s\n", wl.ID.Hex())
		fmt.Printf("  - User ID:     %s\n", wl.UserID.Hex())
		fmt.Printf("  - Items Count: %d\n", len(wl.Items))
		for j, item := range wl.Items {
			fmt.Printf("    * Item [%d]: %s\n", j, item.Hex())
		}
	}

	// 2. Check products collection
	productColl := config.DB.Collection("products")
	count, _ := productColl.CountDocuments(context.TODO(), bson.M{})
	fmt.Printf("\nTotal products in database: %d\n", count)

	// Print first 2 products for verification
	pCursor, err := productColl.Find(context.TODO(), bson.M{})
	if err == nil {
		var products []models.Product
		pCursor.All(context.TODO(), &products)
		for idx, p := range products {
			if idx >= 2 {
				break
			}
			fmt.Printf("  - Product [%d]: Name=%s, ID=%s, Price=%.2f\n", idx, p.Name, p.ID.Hex(), p.Price)
		}
		pCursor.Close(context.TODO())
	}

	fmt.Println("===================================================\n")
}
