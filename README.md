# 🛒 E-Commerce Web Application (React + Go)

## 📌 Project Overview

A full-stack e-commerce application built using **React** and **Go (Golang)** as part of my journey to strengthen backend development skills.
This project focuses on building scalable APIs, implementing authentication, and integrating a modern frontend with a high-performance backend.

---

## 🎯 Key Highlights

* Full-stack architecture (React + Go)
* RESTful API development
* JWT-based authentication
* Backend-focused learning project
* Clean and responsive UI

---

## 🚀 Features

### 👤 User Functionality

* User registration & login
* Browse products
* Add/remove items from cart
* Place orders

### 🛠️ Admin Functionality

* Add, update, and delete products
* Manage orders and users

---

## 🧱 Tech Stack

### Frontend

* React.js
* Axios
* Tailwind CSS / CSS
* UI assisted using AI tools (Lovable)

### Backend

* Go (Golang)
* Gin / Fiber
* REST APIs
* JWT Authentication

### Database

* PostgreSQL / MongoDB

---

## 🏗️ System Architecture

Client (React)
⬇️ HTTP Requests
Server (Go API)
⬇️
Database

---

## 📂 Folder Structure

```
ecommerce-app/
│
├── frontend/
│   ├── src/
│   ├── components/
│   └── pages/
│
├── backend/
│   ├── main.go
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   └── middleware/
│
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```
git clone https://github.com/Jaluaa/E-commerce-website
cd ecommerce-app
```

### 2️⃣ Backend Setup

```
cd backend
go mod init ecommerce
go mod tidy
go run main.go
```

### 3️⃣ Frontend Setup

```
cd frontend
npm install
npm start
```

---

## 🔐 Environment Variables

```
PORT=5000
DB_URL=your_database_url
JWT_SECRET=your_secret_key
```

---

## 📡 API Endpoints

### Auth

* POST /api/auth/register
* POST /api/auth/login

### Products

* GET /api/products
* POST /api/products
* PUT /api/products/:id
* DELETE /api/products/:id

### Orders

* POST /api/orders
* GET /api/orders

---

## 🧪 Future Improvements

* Payment integration
* Product search & filters
* Image uploads
* Order tracking

---

## 🎓 Learning Outcomes

* Backend development using Go
* Building REST APIs
* Authentication using JWT
* Integrating frontend with backend
* Structuring scalable applications

---

## 👩‍💻 Author

**Jalwa Jabbar**
B.Tech Computer Science Engineering Student

---
