// Main application file
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const MobileDetect = require('mobile-detect');
const nodemailer = require('nodemailer');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Import database connection
const db = require('./config/database');

// Test database connection
db.getConnection()
  .then(connection => {
    console.log('Database connection successful');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'mova-session-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Mobile detection middleware
app.use((req, res, next) => {
  const md = new MobileDetect(req.headers['user-agent']);
  res.locals.isMobile = !!md.mobile();
  res.locals.isAndroid = !!md.is('AndroidOS');
  res.locals.isIOS = !!md.is('iOS');
  res.locals.showAppDownloadPrompt = 
    (res.locals.isMobile && !req.cookies.hideAppPrompt);
  next();
});

// Import authentication middleware
const { setCurrentUser } = require('./middlewares/auth');

// Use setCurrentUser middleware for all routes
app.use(setCurrentUser);

// Import routes
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin/index'); // Add admin routes
const adminUsersRoutes = require('./routes/admin/users');

// Use routes
app.use('/', homeRoutes);
app.use('/auth', authRoutes);
app.use('/brands', brandRoutes);
app.use('/products', productRoutes);
app.use('/user', userRoutes);
app.use('/admin', adminRoutes); // Add admin routes
app.use('/admin/users', adminUsersRoutes);




app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
app.use((req, res, next) => {
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you requested could not be found.',
    currentPage: ''
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { 
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    currentPage: ''
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;