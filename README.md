# Task 3: MongoDB & Express Full-Stack Blog Application

A production-grade full-stack web application with a **Node.js + Express.js** backend, **MongoDB & Mongoose database integration**, **JWT authentication with bcrypt password encryption**, and an interactive frontend featuring an **Individual Blog Details view page**.

---

## 🌟 Key Accomplishments in Task 3

### 1. 🍃 Database Connection (MongoDB & Mongoose)
- Connects to external MongoDB (via `MONGO_URI` environment variable) or automatically spins up an embedded in-memory MongoDB instance with zero manual setup required.
- Full Mongoose Object Data Modeling (ODM) with Schema validation, indexes, and pre-save password hashing hooks.

### 2. 🔐 Secure User Credentials & Blog Data
- **User Registration (`POST /api/auth/register`)**: Encrypts passwords using `bcryptjs` and saves user documents to MongoDB.
- **User Login (`POST /api/auth/login`)**: Verifies credentials against MongoDB and generates signed JWT tokens.
- **Create Blog (`POST /api/blogs`)**: Stores blog post documents in MongoDB referencing the logged-in user's ObjectId.

### 3. 📰 Retrieve & Display All Blogs
- **Get Blogs (`GET /api/blogs`)**: Queries MongoDB using Mongoose, populating author details (`username`, `email`), and returning sorted articles.
- Frontend main feed renders all database articles dynamically with category badges, author info, and search filter.

### 4. 📖 Dedicated Individual Blog Details Page
- **Get Blog by ID (`GET /api/blogs/:id`)**: Retrieves single blog post from MongoDB with populated author fields.
- **Dedicated View Page (`public/blog.html`)**: Interactive page to view complete article text, full cover photo, author avatar/info, category pill, and publication date.

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
npm start
```
Open **http://localhost:3000** in your browser.

### 3. Run Automated Tests
```bash
npm test
```

---

## 📂 Project Architecture

```
task-3/
├── public/
│   ├── css/
│   │   └── styles.css        # Stylesheet
│   ├── js/
│   │   ├── app.js            # Main feed client logic
│   │   └── blog-details.js   # Individual blog details page logic
│   ├── index.html            # Main blog feed UI
│   └── blog.html             # Individual blog details view page
├── src/
│   ├── app.js                # Express application setup
│   ├── config/
│   │   ├── config.js         # Configuration settings
│   │   └── db.js             # MongoDB & Mongoose connection
│   ├── controllers/
│   │   ├── authController.js # Auth operations (MongoDB)
│   │   └── blogController.js # Blog operations (MongoDB)
│   ├── middleware/
│   │   └── authMiddleware.js # JWT verification & user lookup
│   ├── models/
│   │   ├── User.js           # Mongoose User model with bcrypt
│   │   └── Blog.js           # Mongoose Blog model
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── blogRoutes.js
│   └── seed/
│       └── seed.js           # Initial database seeder
├── tests/
│   └── test.js               # Automated test suite
├── package.json
└── server.js                 # App entry point
```
