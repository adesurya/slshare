// Main application file 
//app.js

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

const expressLayouts = require('express-ejs-layouts');

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

console.log('View engine settings:');
console.log('  views directory:', app.get('views'));
console.log('  view engine:', app.get('view engine'));

// Configure express-ejs-layouts
app.use(expressLayouts);
app.set('layout', 'home'); // Default layout
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

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

// Import authentication middlewares
const { setCurrentUser } = require('./middlewares/auth');
const { setCurrentAdmin, setAdminTemplateDefaults } = require('./middlewares/adminAuth');

// Use setCurrentUser middleware for all routes
app.use(setCurrentUser);

// Special layout handling for admin routes
app.use('/admin', (req, res, next) => {
  res.locals.layout = 'admin/layouts/main';
  next();
});

// Use setCurrentAdmin middleware for all admin routes
app.use('/admin', setCurrentAdmin);

// Use middleware to set admin template defaults
app.use('/admin', setAdminTemplateDefaults);

app.use('/brands', (req, res, next) => {
  console.log('Brands middleware triggered');
  res.locals.layout = 'home'; // Force set layout
  next();
});

// Request logging for development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });
}

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/home');
const brandRoutes = require('./routes/brands');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin/index');

// DEBUGGING: Cetak semua properti dan metode pada routes
console.log('Routes loaded:');
console.log('  home routes:', Object.keys(homeRoutes));
console.log('  auth routes:', Object.keys(authRoutes));
console.log('  brand routes:', Object.keys(brandRoutes));
console.log('  product routes:', Object.keys(productRoutes));
console.log('  user routes:', Object.keys(userRoutes));
console.log('  admin routes:', Object.keys(adminRoutes));

// Use routes - PENTING: Urutan routes sangat berpengaruh!
app.use('/', homeRoutes); // Home route harus pertama
app.use('/auth', authRoutes);

app.use('/brands', brandRoutes);

app.use('/products', productRoutes); // Produk routes
app.use('/user', userRoutes);

// Default route untuk halaman home
app.get('/', (req, res) => {
  // Log untuk debugging
  console.log('Rendering home page');
  console.log('Current view locals:', res.locals);
  
  res.render('home/index', { 
    title: 'MOVA - Belanja Sambil Cuan',
    currentPage: 'home',
    showSearchBar: true
  });
});

// View testing route
app.get('/view-test', (req, res) => {
  res.render('test', { layout: false, message: 'Test view is working!' });
});

// Admin routes - all admin routes go through main admin router
app.use('/admin', adminRoutes);

// Route for admin root path - redirects to login or dashboard
app.get('/admin', (req, res) => {
  if (req.session.adminId) {
    res.redirect('/admin/dashboard');
  } else {
    res.redirect('/admin/auth/login');
  }
});

// 404 handler for admin routes
app.use('/admin/*', (req, res) => {
  res.status(404).render('admin/error', {
    title: 'Page Not Found',
    message: 'The admin page you requested could not be found.',
    layout: 'admin/layouts/main',
    section: 'dashboard', // Default section
    admin: req.session.adminId ? {
      id: req.session.adminId,
      username: req.session.adminUsername,
      role: req.session.adminRole
    } : null
  });
});

// Error handling middleware
app.use((req, res, next) => {
  console.log('404 handler triggered for URL:', req.originalUrl);
  res.status(404).render('error', { 
    title: 'Page Not Found',
    message: 'The page you requested could not be found.',
    currentPage: ''
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('error', { 
    title: 'Server Error',
    message: 'Something went wrong on our end.',
    currentPage: ''
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`View engine: ${app.get('view engine')}`);
  console.log(`Views directory: ${app.get('views')}`);
  console.log(`Default layout: ${app.get('layout')}`);
});

module.exports = app;