# 🧙‍♂️ FandomRealm E-Commerce Web Application (React + Go + MongoDB)

Welcome to **FandomRealm**, a premium, immersive full-stack e-commerce experience crafted for true collectors and pop-culture enthusiasts. Discover high-fidelity replicas, custom apparel, and magical memorabilia across iconic universes—from the wizarding world to the high-energy K-pop stage.

This project features a high-performance backend built in **Go (Golang)** using the **Gin** web framework, and a gorgeous, glassmorphic interactive frontend powered by **React**, **Vite**, and **Tailwind CSS**.

---

## 🌌 Core Fandom Universes

* **⚡ Harry Potter Realm:** High-fidelity replicas, custom wands, wizarding apparel, and magical house accessories.
* **🎤 K-pop Stadium:** Album collections, official lightsticks, limited edition photo cards, and fandom merch.
* **🎬 K-drama Memories:** Iconic memorabilia, plushies, OST albums, and aesthetic items from classic dramas.
* **☕ Friends Central Perk:** Cozy apparel, mugs, stationery, and vintage-themed merchandise from the iconic sitcom.

---

## 🚀 Key Features

### 👤 User Experience
* **🔐 Secure Authentication:** Seamless sign-up & log-in powered by **JWT (JSON Web Tokens)** with password hashing via **bcrypt**.
* **📧 Email Verification:** Active verification step utilizing automated verification codes sent directly to the user's email via **SMTP**.
* **🛍️ Immersive Catalog:** High-performance filtering, beautiful product cards, real-time ratings, categories, and stock tracking.
* **🛒 Active Cart & Wishlist:** Fully-featured, responsive shopping cart and wishlist states synced in real-time.
* **💳 Razorpay Payment Gateway:** Secure checkout integration facilitating order creation and verification.
* **📦 Order History:** User-facing tracking of all previous orders, timestamps, and item details.

### 🛠️ Administrative Portal
* **📈 Real-Time Dashboard Stats:** Immediate access to business metrics, total sales, user statistics, and item listings.
* **📦 Inventory & Order Control:** Admin capability to view all store orders and update shipping and fulfillment states.
* **✨ Product CRUD:** Add, update, or remove merchandise dynamically from the database.

---

## 🧱 Premium Tech Stack

### 💻 Frontend
* **React.js & Vite:** Ultrafast HMR dev environments and optimized production bundles.
* **Tailwind CSS:** Modern responsive styling using elegant HSL customized colors, glowing ambient backdrops, and interactive glassmorphic UI elements.
* **Axios:** Robust HTTP client for secure asynchronous backend communication.

### ⚙️ Backend
* **Go (Golang):** Compiled, concurrent, high-performance programming language.
* **Gin Web Framework:** High-performance HTTP router and middleware engine.
* **golang-jwt:** Secure creation and validation of JSON Web Tokens.
* **SMTP (Gmail):** Integrated email distribution for verification codes.

### 🗄️ Database
* **MongoDB Atlas:** Fully-managed Cloud NoSQL database utilizing the official `mongo-driver` package for dynamic data handling.

---

## 📂 Project Directory Structure

```
E-commerce-website/
├── frontend/                     # React + Vite Client
│   ├── src/
│   │   ├── components/           # Reusable UI elements (ProductCard, Footer, etc.)
│   │   ├── contexts/             # Global contexts (Auth, Cart, Wishlist, Toast)
│   │   ├── pages/                # Views (Home, Catalog, ProductDetail, Cart, Admin)
│   │   └── Main.jsx
│   ├── public/                   # Static assets & fandom image categories
│   ├── index.html
│   ├── vite.config.js            # Vite configurations
│   └── .env                      # Frontend environment setup
│
├── backend/                      # Gin + MongoDB Server
│   ├── cmd/
│   │   └── main.go               # Server entry point & DB seeding logic
│   ├── config/                   # MongoDB connection & ENV loading logic
│   ├── controllers/              # Request handlers (Auth, Products, Cart, Orders, Admin)
│   ├── middleware/               # AuthRequired & AdminRequired access checks
│   ├── models/                   # BSON & JSON schemas (User, Product, Order, Cart)
│   ├── routes/                   # Route groups & API endpoints definition
│   ├── utils/                    # Helper packages (emails, helper operations)
│   └── .env                      # Private server configuration variables
│
└── README.md                     # Root project documentation
```

---

## ⚙️ Setup & Installation Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/Jaluaa/E-commerce-website
cd E-commerce-website
```

### 2️⃣ Configure Environment Variables

#### 🛡️ Backend (`/backend/.env`)
Create a `.env` file inside the `backend` folder and populate it with your credentials:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
DB_NAME=ecommerce
JWT_SECRET=your_jwt_signing_key

# SMTP Configuration (For email verification codes)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_sending_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM_NAME="FandomRealm Store 🧙‍♂️"

# Razorpay Credentials (For test/production payments)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### 🎨 Frontend (`/frontend/.env`)
Create a `.env` file inside the `frontend` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

---

### 3️⃣ Launch the Applications

#### 🛠️ Start Go Backend
```bash
cd backend
go mod tidy
go run cmd/main.go
```
*The server will start on port `5000` (default) and automatically seed the database with initial products and an administrator account if it is empty.*
* **Admin Credentials:** `admin@example.com` | Password: `admin123`

#### 🎨 Start React Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*The client application will start on `http://localhost:5173` with full Hot Module Replacement (HMR).*

---

## 📡 API Reference Endpoints

### 🔐 Authentication Operations
* `POST /api/auth/register` - Create a new user account.
* `POST /api/auth/login` - Authenticate user & return JWT token.
* `POST /api/auth/verify` - Confirm user email via verification code.
* `POST /api/auth/resend-code` - Resend verification code email.

### 🛍️ Store Catalog & Products
* `GET /api/products` - Retrieve list of all products (with category/fandom filtering).
* `GET /api/products/:id` - Retrieve complete details of a single product.
* `POST /api/products` - Create new merchandise *(Admin only)*.
* `PUT /api/products/:id` - Modify product specifications *(Admin only)*.
* `DELETE /api/products/:id` - Remove product from store *(Admin only)*.

### 🛒 Cart Management
* `GET /api/cart` - View items currently in user's cart.
* `POST /api/cart` - Add an item / adjust quantity in the cart.
* `DELETE /api/cart/:productId` - Remove item completely from the cart.

### ❤️ Wishlist Management
* `GET /api/wishlist` - View user's saved wishlist items.
* `POST /api/wishlist` - Add a product to the wishlist.
* `DELETE /api/wishlist/:productId` - Remove product from the wishlist.

### 💳 Checkout & Razorpay Payments
* `POST /api/orders/checkout` - Create a baseline store order.
* `POST /api/payment/razorpay/order` - Generate a secure checkout order with Razorpay.
* `POST /api/payment/razorpay/verify` - Validate payment cryptographic signatures.
* `GET /api/orders` - Retrieve historical list of user orders.

### 👑 Administrative Operations
* `GET /api/admin/orders` - Retrieve order list across all clients *(Admin only)*.
* `PUT /api/admin/orders/:id/status` - Update shipping/processing state of an order *(Admin only)*.
* `GET /api/admin/stats` - Fetch overall store statistics & total sales metrics *(Admin only)*.

---

## 👩‍💻 Author & Contributions

**Jalwa Jabbar**  
*B.Tech Computer Science Engineering Student*

*Feel free to open issues or pull requests to enhance the FandomRealm store experience!*
