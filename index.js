/* Main Application Entry Point - Refactored */
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const config = require('./config');
const { connectToDatabase } = require('./connection');
const { checkAuthentication } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/security');

// Routes
const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute = require('./routes/user');

const app = express();

app.set('trust proxy', config.trustProxy);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(globalLimiter);

app.use((req, res, next) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  res.locals.baseUrl = config.appBaseUrl || origin;
  next();
});

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

async function startServer() {
  try {
    await connectToDatabase(config.mongoUrl);
    app.listen(config.port, () => {
      console.log(`Server Started on port ${config.port}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
}

startServer();