require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./connection');
const cookieParser = require('cookie-parser');
const { checkAuthentication, restrictTo } = require('./middleware/auth');

// 1. Import Routes
const urlRoute = require('./routes/url.js');
const staticRoute = require('./routes/staticRouter.js');
const userRoute = require('./routes/user.js');

const app = express();
const port = process.env.PORT || 8000;

// 2. Connect to DB
const mongoURL = process.env.MONGO_URL;
connectToDatabase(mongoURL);

// 3. Setup EJS
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// 4. Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(cookieParser());

app.get('/api/ping', (req, res) => {
    console.log("🔔 Keep-Alive Ping Received");
    res.status(200).send("Pong");
});

app.use(checkAuthentication);

// 5. Routes
app.use('/user', userRoute); 
app.use('/url', urlRoute); 
app.use('/', staticRoute); 

app.listen(port, () => {
  console.log(`Server Started on port ${port}`);
});