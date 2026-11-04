# 🏡 Zovira — Discover Stays. Experience More.

**Zovira** is a full-stack accommodation booking platform inspired by modern hospitality marketplaces. It allows users to explore available properties, discover comfortable stays, manage their listings, save favourite homes, and share reviews.

The platform aims to make discovering and booking accommodations simple, convenient, and user-friendly.

## ✨ Features

### 👤 User Authentication
- User registration and login.
- Secure password-based authentication.
- Session-based user management.
- Role-based access for guests and hosts.

### 🏠 Property Management
- Explore all available properties.
- View detailed property information.
- Hosts can add new properties.
- Edit and delete property listings.
- Upload property images.

### ❤️ Favourite System
- Add properties to favourites.
- Remove properties from favourites.
- View saved properties.

### ⭐ Review & Rating System
- Users can submit property reviews.
- Share feedback about their experiences.
- Display reviews on property detail pages.

### 📅 Booking System
- Booking management functionality.
- Property booking workflow.
- Guest and host-oriented booking experience.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript | Client-side functionality |
| Node.js | Backend runtime |
| Express.js | Server and REST routes |
| MongoDB | Database |
| Mongoose | Database modeling |
| EJS | Server-side rendering |
| Multer | Image uploads |
| Express Session | Session management |
| MongoDB Session Store | Persistent sessions |

## 📂 Project Structure

```text
Zovira/
│
├── controllers/
│   ├── authController.js
│   ├── hostController.js
│   └── storeController.js
│
├── models/
│   ├── home.js
│   ├── user.js
│   ├── favourite.js
│   ├── booking.js
│   └── review.js
│
├── routes/
│   ├── authRouter.js
│   ├── hostRouter.js
│   └── storeRouter.js
│
├── views/
│   ├── auth/
│   ├── host/
│   ├── store/
│   └── includes/
│
├── public/
│   ├── css/
│   ├── js/
│   └── images/
│
├── uploads/
├── utils/
├── app.js
├── package.json
└── README.md
```

*Note: Adjust the structure above to match your actual project folders.*

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Navigate to the project

```bash
cd Zovira
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory.

```env
PORT=3001
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=your_session_secret
```

### 5. Start the development server

```bash
npm run dev
```

Open your browser:

```text
http://localhost:3001
```

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| PORT | Application server port |
| MONGODB_URI | MongoDB connection URL |
| SESSION_SECRET | Secret used for session management |

**Important:** Never upload your `.env` file or database credentials to GitHub.

## 🎯 Project Objective

The objective of Zovira is to develop a scalable, user-friendly accommodation marketplace while gaining practical experience in full-stack web development, database management, authentication, backend architecture, and real-world application development.

## 👨‍💻 Developer

**Titas Mal**

B.Tech Computer Science & Engineering  
Jalpaiguri Government Engineering College

- GitHub: [@titasmal75-wq](https://github.com/titasmal75-wq)

---

<p align="center">
  **Zovira — Find Your Place. Make Every Journey Special.**
</p>