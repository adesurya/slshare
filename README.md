# MOVA Web Application

A mobile-first web application that offers cashback for shopping through affiliate links.

## Features

- Mobile-first design (not just responsive, but designed for mobile with the same look on desktop)
- App download promotion with OS detection (Android/iOS)
- User authentication system with email verification
- Guest access with restricted functionalities
- Cashback tracking dashboard
- Brand and product browsing
- Withdrawal system
- Dark mode support

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Database**: MySQL
- **Template Engine**: EJS
- **Authentication**: Session-based with bcrypt + email verification

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- MySQL (v5.7 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mova-web-app.git
   cd mova-web-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   APP_URL=http://localhost:3000

   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=mova_app_db
   
   SESSION_SECRET=your_session_secret
   
   ANDROID_APP_URL=https://play.google.com/store/apps/details?id=com.mova.app
   IOS_APP_URL=https://apps.apple.com/app/mova-app/id123456789
   
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=your_mailtrap_username
   EMAIL_PASS=your_mailtrap_password
   EMAIL_FROM=noreply@mova.app
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Start the application:
   ```
   npm start
   ```

6. Access the application at `http://localhost:3000`

### Email Verification Setup

For development, you can use [Mailtrap](https://mailtrap.io/) (free tier) to test email verification:

1. Sign up for a Mailtrap account
2. Create an inbox
3. Get the SMTP credentials
4. Update the EMAIL_* variables in your .env file

### Development Mode

For development with automatic restarts:
```
npm run dev
```

## Project Structure

```
project-root/
├── public/               # Static assets
│   ├── css/              # Stylesheets
│   ├── js/               # Client-side JavaScript
│   └── images/           # Images and icons
├── views/                # EJS templates
├── routes/               # Express route handlers
├── models/               # Database models
├── config/               # Configuration files
├── middlewares/          # Custom middlewares
├── scripts/              # Utility scripts
├── app.js                # Main application file
└── package.json          # Project dependencies
```

## User Authentication

The application includes a complete user authentication system:

- Registration with validation and email verification
- Login with session management
- Password hashing with bcrypt
- Remember-me functionality
- Session management
- Password reset functionality

Test user credentials:
- Username: testuser
- Password: password123

## Guest Access

The application allows guest users to:
- Browse products and brands
- View product details
- Search for products

Guests are prompted to log in when they try to:
- Add products to wishlist
- Buy products with cashback
- Share affiliate links
- Access user-specific features

## Mobile Detection

The application detects mobile devices and suggests app downloads appropriately:
- Android devices are prompted to download from Google Play
- iOS devices are prompted to download from App Store
- Users can dismiss the prompt (stored in cookies)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Font Awesome for icons
- bcrypt for password hashing
- Express.js for the web framework
- MySQL for the database
- Nodemailer for email functionality