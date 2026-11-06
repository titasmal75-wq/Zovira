# 🏡 Zovira — Discover Stays. Experience More.

[![Live Demo](https://img.shields.io/badge/Live_Demo-zovira--1.onrender.com-FF385C?style=for-the-badge&logo=render&logoColor=white)](https://zovira-1.onrender.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_CDN-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)

> 🌐 **Live Website:** [https://zovira-1.onrender.com/](https://zovira-1.onrender.com/)

**Zovira** is a modern, full-stack accommodation booking platform inspired by contemporary hospitality marketplaces. It allows guests to discover and book comfortable stays, manage their itineraries, and share authentic reviews, while enabling hosts to manage property listings, upload high-resolution photos to the cloud, and oversee guest reservations.

The platform is built with a responsive, glassmorphic dark UI and clean, robust backend architecture.

---

## ✨ Features

### 👤 User Authentication & Role Management
- User registration and login with encrypted passwords (`bcryptjs`).
- Session-based authentication stored persistently in MongoDB (`connect-mongodb-session`).
- Role-based access control distinguishing between **Guests** and **Hosts**.
- Protected routes for host dashboards and guest reservations.

### 🏠 Property Management (Host Dashboard)
- Hosts can create, view, edit, and delete their property listings.
- Strict ownership verification — hosts can only modify their own properties.
- Dynamic guest capacity and price per night settings.
- Interactive property detail pages with live pricing breakdown.

### ☁️ Cloud Image Uploads (Cloudinary)
- Seamless property photo uploads powered by **Cloudinary** and `multer-storage-cloudinary`.
- Direct streaming from client to cloud storage — no local disk clutter.
- High-resolution, CDN-backed image delivery with fallback handling.

### 📅 Booking & Reservation System
- Date pickers with validation (past date prevention, check-out after check-in).
- Real-time stay duration and total cost calculation.
- Guest booking history with reservation status badges (**Confirmed**, **Pending**, **Cancelled**).
- Guest cancellation workflow with instant status updates.
- Dedicated host bookings view to track all incoming guest reservations.

### ⭐ Review & Rating System
- Verified guests can write reviews with a 1-to-5 star rating and detailed feedback.
- Duplicate review prevention per property.
- Automatic recalculation of the property's average guest rating upon submission or deletion.
- Review authors can delete their own reviews.
- Polished review cards with user initials, star badges, and timestamps.

### ❤️ Favourites System
- Guests can save their favourite properties for quick access later.
- One-click bookmarking and removal.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Backend JavaScript runtime |
| **Express.js** | Web server and REST routing |
| **MongoDB & Mongoose** | NoSQL database and schema modeling |
| **EJS** | Dynamic server-side templating |
| **Cloudinary** | Cloud-based media storage and CDN delivery |
| **Multer & multer-storage-cloudinary** | Multipart form handling & cloud upload stream |
| **Express Session & connect-mongodb-session** | Secure, persistent session store |
| **Bcrypt.js** | Password hashing & encryption |
| **CSS3 & Glassmorphism** | Custom dark-theme styling, CSS variables & animations |
| **Font Awesome** | Modern iconography |

---

## 📂 Project Structure

```text
Zovira/
│
├── controllers/
│   ├── authController.js       # Login, signup, logout
│   ├── bookingController.js    # Create, view, cancel bookings
│   ├── hostController.js       # Add, edit, delete host properties
│   ├── reviewController.js     # Add & delete property reviews
│   └── storeController.js      # Home exploration, details & favourites
│
├── models/
│   ├── booking.js              # Booking schema & status
│   ├── favourite.js            # Favourites relationship
│   ├── home.js                 # Property schema with virtual photo URLs
│   ├── review.js               # Review & rating schema
│   └── user.js                 # User schema (guest & host roles)
│
├── routes/
│   ├── authRouter.js           # Authentication endpoints
│   ├── hostRouter.js           # Host management endpoints
│   ├── reviewRouter.js         # Review endpoints
│   └── storeRouter.js          # Store & booking endpoints
│
├── views/
│   ├── auth/                   # Login & registration views
│   ├── host/                   # Host homes & edit home views
│   ├── partials/               # Nav, head, flash messages, errors
│   └── store/                  # Explore, home-detail, bookings, favourites
│
├── public/                     # Static assets (styles.css, output.css)
├── utils/
│   ├── cloudinary.js           # Cloudinary SDK & Multer storage configuration
│   ├── database.js             # Database utilities
│   └── pathUtil.js             # Root directory resolution
│
├── app.js                      # Application entry point & middleware setup
├── package.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/titasmal75-wq/Zovira.git
```

### 2. Navigate to the project directory

```bash
cd Zovira
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 5. Start the development server

```bash
npm run dev
```

Open your browser and visit:

```text
http://localhost:3001
```

---

## 🔐 Environment Variables

| Variable | Description | Required |
|---|---|---|
| `PORT` | Application server port (default: `3001`) | No |
| `MONGODB_URI` | MongoDB Atlas / local connection string | **Yes** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account cloud name | **Yes** |
| `CLOUDINARY_API_KEY` | Cloudinary API key | **Yes** |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | **Yes** |

> **Security Note:** Never commit your `.env` file or sensitive credentials to GitHub. Keep `.env` included in `.gitignore`.

---

## 🎯 Project Objective

The objective of **Zovira** is to develop a production-ready, scalable accommodation marketplace while applying industry-standard patterns in full-stack architecture, cloud media management, database relationships, and responsive UI design.

---

## 👨‍💻 Developer

**Titas Mal**  
B.Tech in Computer Science & Engineering  
Jalpaiguri Government Engineering College  

- 🌐 Live Application: [https://zovira-1.onrender.com/](https://zovira-1.onrender.com/)
- GitHub: [@titasmal75-wq](https://github.com/titasmal75-wq)

---

<p align="center">
  <b>Zovira — Find Your Place. Make Every Journey Special.</b><br>
  <a href="https://zovira-1.onrender.com/">Visit Live Application 🚀</a>
</p>
