
# 🔗 ShortURL - Premium Link Shortener

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-8C8C8C?style=for-the-badge&logo=ejs&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![bcrypt](https://img.shields.io/badge/bcrypt-00599C?style=for-the-badge)
![Live Demo](https://img.shields.io/badge/Live%20Demo-Coming%20Soon-blueviolet?style=for-the-badge)

A modern, production-ready URL shortener built with **Node.js**, **Express**, and **MongoDB**. Features a high-performance JWT-based authentication system, bcrypt password hashing, a glassmorphism dashboard, and real-time link analytics.

> **Live Demo:** [Coming Soon](#)

---

## ✨ Features

### Core Functionality
- **URL Shortening:** Convert long URLs into short, shareable links with custom short IDs
- **JWT Authentication:** Stateless, scalable user sessions with secure cookie storage
- **Bcrypt Security:** Passwords are hashed with bcrypt for maximum security :lock:
- **Auto-Login:** Users are immediately authenticated upon successful registration
- **Link Management:** View all your shortened links in one dashboard with quick actions
- **Delete Links:** Remove unwanted links with one click

### Analytics & Tracking
- **Click Analytics:** Track total clicks, unique visitors, and visit history
- **Time-Based Insights:** Hourly breakdown charts and 30-day performance trends
- **Geographic Tracking:** Interactive heatmaps showing clicks by location (city, state, country)
- **Device Analytics:** Desktop, mobile, tablet, and bot detection
- **Referral Sources:** Track traffic from WhatsApp, Telegram, LinkedIn, Google, and more

### Security
- **Bcrypt Password Hashing:** All user passwords are securely hashed using bcrypt.
- **JWT & Cookie Security:** Secure, stateless authentication with JWT and cookies.
- **Environment Variables:** Sensitive data is managed via environment variables.

### User Experience
- **Premium UI:** Floating pill-shaped navigation and glassmorphism cards with smooth transitions
- **Responsive Design:** Fully optimized for mobile, tablet, and desktop views
- **Social Sharing:** Direct share buttons for popular platforms with tracking parameters
- **Real-time Updates:** Live analytics and instant link generation

---

## 🛠️ Tech Stack


### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **Cookie-Parser** - Cookie handling

### Frontend
- **EJS** - Embedded JavaScript Templates
- **CSS3** - Modern Flexbox/Grid with Glassmorphism effects
- **Chart.js** - Analytics charts
- **Leaflet.js** - Interactive maps
- **Phosphor Icons** - Icon library

### Utilities
- **NanoID** - Unique ID generation
- **Dotenv** - Environment variable management
- **IP Geolocation** - Location tracking (ipinfo.io)
- **User Agent Parser** - Device detection

---

---

## 📁 Project Structure

```
url-shortener/
├── controllers/
│   ├── url.js                    # URL business logic
│   └── user.js                   # User business logic
├── middleware/
│   ├── auth.js                   # Authentication middleware
│   └── index.js                  # Middleware exports
├── models/
│   ├── url.js                    # MongoDB schema for URLs
│   └── user.js                   # MongoDB schema for users
├── routes/
│   ├── staticRouter.js           # Static pages routes
│   ├── url.js                    # URL shortening routes
│   └── user.js                   # Authentication routes
├── service/
│   └── auth.js                   # JWT service functions
├── public/
│   ├── css/
│   │   ├── home.css              # Home page styles
│   │   ├── dashboard.css         # Dashboard styles
│   │   ├── analytics.css         # Analytics page styles
│   │   └── about.css             # About page styles
│   └── js/
│       ├── home-modals.js        # Home page modals
│       ├── analytics-main.js     # Analytics initialization
│       ├── analytics-charts.js   # Chart.js charts
│       ├── analytics-map.js      # Leaflet heatmap
│       ├── analytics-geo.js      # Geographic data
│       ├── analytics-modals.js   # Analytics modals
│       └── about.js              # About page animations
├── views/
│   ├── home.ejs                  # Home/shortening page
│   ├── dashboard.ejs             # User dashboard
│   ├── analytics.ejs             # Analytics page
│   ├── about.ejs                 # About/features page
│   ├── signup.ejs                # Registration page
│   └── login.ejs                 # Login page
├── connection.js                 # MongoDB connection
├── index.js                      # Server entry point
├── package.json                  # Dependencies
└── .env                          # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v14 or higher)
* **MongoDB** (local installation or MongoDB Atlas)
* **npm** or **yarn**

### Installation

1. Clone the repository and install dependencies:

```bash
git clone https://github.com/HiteshShonak/short-url.git
cd short-url
npm install
```

2. Create a `.env` file in the root directory:

```env
PORT=8000
MONGO_URL=mongodb://localhost:27017/short-url
JWT_SECRET=your_super_secret_key_here
```

3. Start the application:

```bash
# For development
npm run dev

# For production
npm start
```

4. Access the application at `http://localhost:8000`

---

## 📖 Usage

### Creating a Short URL
1. Sign up or log in to your account
2. Navigate to the home page
3. Paste your long URL into the input field
4. Click "Shorten It"
5. Copy and share your generated short link

### Viewing Analytics
1. From the home page, click "📊 Stats" next to any link
2. View comprehensive analytics including:
   * Total clicks and unique visitors
   * Hourly activity chart
   * 30-day performance trend
   * Geographic heatmap
   * Device breakdown
   * Referral sources

### Sharing Links
1. Click the share icon next to any link
2. Choose your platform (WhatsApp, Telegram, LinkedIn, Instagram)
3. The link will automatically include tracking parameters

---

## 🗺️ API Endpoints

### Authentication Routes
* `POST /user/` - Register a new user & auto-login
* `POST /user/login` - Authenticate user
* `GET /user/logout` - Clear session cookies

### URL Operations
* `POST /url/` - Create a shortened URL (requires authentication)
* `GET /url/:shortId` - Redirect to original destination
* `GET /url/analytics/:shortId` - Get detailed click statistics
* `POST /url/delete/:shortId` - Remove a link (requires authentication)

### Static Pages
* `GET /` - Home page
* `GET /dashboard` - User dashboard (requires authentication)
* `GET /about` - About/features page
* `GET /login` - Login page
* `GET /signup` - Signup page

---

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 8000) | No |
| `MONGO_URL` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT encryption | Yes |

---

## 📸 Screenshots

* **Home Page:** URL shortening form with recent links table and action buttons
* **Dashboard:** Personalized view with quick actions and modern gradient design
* **Analytics:** Interactive charts, geographic heatmap, and detailed visitor insights

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👤 Author

**Hitesh**

* GitHub: [@HiteshShonak](https://github.com/HiteshShonak)

---

## 🙏 Acknowledgments

* [Chart.js](https://www.chartjs.org/) - Beautiful, responsive charts
* [Leaflet.js](https://leafletjs.com/) - Interactive maps
* [Phosphor Icons](https://phosphoricons.com/) - Flexible icon library
* [ipinfo.io](https://ipinfo.io/) - IP geolocation API

---

**Note:** This is a personal project built for learning purposes. For production use, additional security measures and optimizations are recommended.