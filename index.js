/* Main Application Entry Point - Refactored */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

const config = require('./config');
const { connectToDatabase } = require('./connection');
const { checkAuthentication } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Routes
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();

// Database connection
connectToDatabase(config.mongoUrl);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Health check
app.get('/api/ping', (req, res) => {
  console.log('🔔 Keep-Alive Ping Received');
  res.status(200).send('Pong');
});

// Authentication
app.use(checkAuthentication);

// Routes
app.use('/user', userRoute);
app.use('/url', urlRoute);
app.use('/', staticRoute);

// Error handling (must be last)
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`Server Started on port ${config.port}`);
});