require('dotenv').config();
const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./connection');
const { logReqRes } = require('./middleware');
const cookieParser = require('cookie-parser');
const {checkAuthentication, restrictTo} = require('./middleware/auth');

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
app.use(logReqRes('server.log'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // This allows parsing form data
app.use(cookieParser());
app.use(checkAuthentication);



// 5. Routes
app.use('/user', userRoute); // Handles User Signup (e.g., /user/signup)
app.use('/url', urlRoute); // Handles generating and redirecting (e.g., /url/abc)
app.use('/', staticRoute); // Handles the Home Page UI

app.listen(port, () => {
  console.log(`Server Started`);
});