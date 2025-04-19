const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { 
  redirectIfAuthenticated, 
  isAuthenticated, 
  requireEmailVerified 
} = require('../middlewares/auth');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your_mailtrap_user',
    pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
  }
});

// Helper function to send verification email
async function sendVerificationEmail(email, username, token) {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/verify-email/${token}`;
  
  const mailOptions = {
    from: `"MOVA App" <${process.env.EMAIL_FROM || 'noreply@mova.app'}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff0033; color: white; padding: 20px; text-align: center;">
          <h1>MOVA App</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #eee;">
          <h2>Hi ${username},</h2>
          <p>Thank you for signing up with MOVA! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #ff0033; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p><a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, no further action is required.</p>
          <p>Best regards,<br>The MOVA Team</p>
        </div>
        <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} MOVA App. All rights reserved.</p>
        </div>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
}

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', { 
    title: 'Login - MOVA',
    errors: [],
    currentPage: 'profile',
    redirect: req.query.redirect || null
  });
});

// Login processing
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login - MOVA',
        errors: errors.array(),
        formData: req.body,
        currentPage: 'profile',
        redirect: req.body.redirect || null
      });
    }

    const { username, password, redirect } = req.body;
    
    // Find user
    const user = await User.findByUsername(username);
    
    if (!user) {
      return res.render('auth/login', {
        title: 'Login - MOVA',
        errors: [{ msg: 'Username not found' }],
        formData: req.body,
        currentPage: 'profile',
        redirect: redirect || null
      });
    }
    
    // Verify password
    const isPasswordValid = await User.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      return res.render('auth/login', {
        title: 'Login - MOVA',
        errors: [{ msg: 'Invalid password' }],
        formData: req.body,
        currentPage: 'profile',
        redirect: redirect || null
      });
    }
    
    // Create session
    req.session.userId = user.id;
    
    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    
    await User.createSession(
      user.id,
      sessionToken,
      req.headers['user-agent'] || 'Unknown',
      expiresAt
    );
    
    // Redirect to original URL or dashboard
    if (redirect) {
      res.redirect(redirect);
    } else {
      res.redirect('/user/dashboard');
    }
  } catch (error) {
    console.error('Login error:', error);
    res.render('auth/login', {
      title: 'Login - MOVA',
      errors: [{ msg: 'An error occurred during login' }],
      formData: req.body,
      currentPage: 'profile',
      redirect: req.body.redirect || null
    });
  }
});

// Register page
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', { 
    title: 'Register - MOVA',
    errors: [],
    currentPage: 'profile',
    redirect: req.query.redirect || null
  });
});

// Register processing
router.post('/register', [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register - MOVA',
        errors: errors.array(),
        formData: req.body,
        currentPage: 'profile',
        redirect: req.body.redirect || null
      });
    }

    const { username, email, password, full_name, redirect } = req.body;
    
    // Check if username already exists
    const existingUsername = await User.findByUsername(username);
    if (existingUsername) {
      return res.render('auth/register', {
        title: 'Register - MOVA',
        errors: [{ msg: 'Username already exists' }],
        formData: req.body,
        currentPage: 'profile',
        redirect: redirect || null
      });
    }
    
    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.render('auth/register', {
        title: 'Register - MOVA',
        errors: [{ msg: 'Email already exists' }],
        formData: req.body,
        currentPage: 'profile',
        redirect: redirect || null
      });
    }
    
    // Create user
    const { id, verificationToken } = await User.create({
      username,
      email,
      password,
      full_name
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, username, verificationToken);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // Continue even if email fails, we'll show a page where they can request a new email
    }
    
    // Create session
    req.session.userId = id;
    
    // Create session token
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    
    await User.createSession(
      id,
      sessionToken,
      req.headers['user-agent'] || 'Unknown',
      expiresAt
    );
    
    // Redirect to verification page
    res.redirect('/auth/verify-email');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('auth/register', {
      title: 'Register - MOVA',
      errors: [{ msg: 'An error occurred during registration' }],
      formData: req.body,
      currentPage: 'profile',
      redirect: req.body.redirect || null
    });
  }
});

// Email verification page
router.get('/verify-email', isAuthenticated, async (req, res) => {
  res.render('auth/verify-email', { 
    title: 'Verify Your Email - MOVA',
    currentPage: 'profile',
    email: req.user.email
  });
});

// Resend verification email
router.post('/resend-verification', isAuthenticated, async (req, res) => {
  try {
    // Check if already verified
    if (req.user.is_verified) {
      return res.redirect('/user/dashboard');
    }
    
    // Generate new verification token
    const verificationToken = await User.regenerateVerificationToken(req.user.id);
    
    if (!verificationToken) {
      return res.render('auth/verify-email', {
        title: 'Verify Your Email - MOVA',
        currentPage: 'profile',
        email: req.user.email,
        error: 'Failed to generate verification token. Please try again later.'
      });
    }
    
    // Send verification email
    await sendVerificationEmail(req.user.email, req.user.username, verificationToken);
    
    res.render('auth/verify-email', {
      title: 'Verify Your Email - MOVA',
      currentPage: 'profile',
      email: req.user.email,
      message: 'Verification email has been sent. Please check your inbox.'
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    res.render('auth/verify-email', {
      title: 'Verify Your Email - MOVA',
      currentPage: 'profile',
      email: req.user.email,
      error: 'Failed to send verification email. Please try again later.'
    });
  }
});

// Verify email with token
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Verify token
    const success = await User.verifyEmail(token);
    
    if (!success) {
      return res.render('auth/verify-result', {
        title: 'Verification Failed - MOVA',
        currentPage: 'profile',
        success: false,
        message: 'Invalid or expired verification link. Please request a new verification email.'
      });
    }
    
    res.render('auth/verify-result', {
      title: 'Email Verified - MOVA',
      currentPage: 'profile',
      success: true,
      message: 'Your email has been successfully verified! You can now use all features of MOVA.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.render('auth/verify-result', {
      title: 'Verification Error - MOVA',
      currentPage: 'profile',
      success: false,
      message: 'An error occurred during verification. Please try again later.'
    });
  }
});

// Forgot password page
router.get('/forgot-password', redirectIfAuthenticated, (req, res) => {
  res.render('auth/forgot-password', {
    title: 'Forgot Password - MOVA',
    currentPage: 'profile'
  });
});

// Request password reset
router.post('/forgot-password', [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/forgot-password', {
        title: 'Forgot Password - MOVA',
        currentPage: 'profile',
        errors: errors.array(),
        formData: req.body
      });
    }
    
    const { email } = req.body;
    
    // Generate reset token
    const resetToken = await User.createPasswordResetToken(email);
    
    if (resetToken) {
      // Send password reset email
      const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/auth/reset-password/${resetToken}?email=${encodeURIComponent(email)}`;
      
      const mailOptions = {
        from: `"MOVA App" <${process.env.EMAIL_FROM || 'noreply@mova.app'}>`,
        to: email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #ff0033; color: white; padding: 20px; text-align: center;">
              <h1>MOVA App</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #eee;">
              <h2>Password Reset Request</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background-color: #ff0033; color: white; padding: 12px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
              </div>
              <p>Or copy and paste this link in your browser:</p>
              <p><a href="${resetUrl}">${resetUrl}</a></p>
              <p>This link will expire in 1 hour.</p>
              <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
              <p>Best regards,<br>The MOVA Team</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} MOVA App. All rights reserved.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
    }
    
    // Always show success message even if email doesn't exist for security
    res.render('auth/forgot-password-success', {
      title: 'Reset Link Sent - MOVA',
      currentPage: 'profile',
      email
    });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.render('auth/forgot-password', {
      title: 'Forgot Password - MOVA',
      currentPage: 'profile',
      errors: [{ msg: 'An error occurred. Please try again later.' }],
      formData: req.body
    });
  }
});

// Reset password page
router.get('/reset-password/:token', redirectIfAuthenticated, (req, res) => {
  const { token } = req.params;
  const { email } = req.query;
  
  if (!token || !email) {
    return res.redirect('/auth/forgot-password');
  }
  
  res.render('auth/reset-password', {
    title: 'Reset Password - MOVA',
    currentPage: 'profile',
    token,
    email
  });
});

// Process password reset
router.post('/reset-password/:token', [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('confirm_password')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], async (req, res) => {
  try {
    const { token } = req.params;
    const { email, password } = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - MOVA',
        currentPage: 'profile',
        token,
        email,
        errors: errors.array()
      });
    }
    
    // Reset password
    const success = await User.resetPassword(token, email, password);
    
    if (!success) {
      return res.render('auth/reset-password', {
        title: 'Reset Password - MOVA',
        currentPage: 'profile',
        token,
        email,
        errors: [{ msg: 'Invalid or expired reset link. Please request a new password reset.' }]
      });
    }
    
    res.render('auth/reset-success', {
      title: 'Password Reset Successful - MOVA',
      currentPage: 'profile'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.render('auth/reset-password', {
      title: 'Reset Password - MOVA',
      currentPage: 'profile',
      token: req.params.token,
      email: req.body.email,
      errors: [{ msg: 'An error occurred. Please try again later.' }]
    });
  }
});

// Logout
router.get('/logout', (req, res) => {
  // Clear session
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/');
  });
});

module.exports = router;