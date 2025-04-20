# MOVA Web Application - Setup and Fix Guide

This guide will help you fix and run the MOVA web application.

## The Problem

The application has several issues that need to be fixed:

1. MySQL query errors with LIMIT and OFFSET parameters
2. Missing EJS templates in the views directory
3. Directory structure issues
4. Empty or broken database.js file

## Solution Steps

Follow these steps to fix and run the application:

### 1. Fix Directory Structure

First, make sure you have the proper directory structure. You can run the startup script to automatically create them:

```bash
# Create the startup.js file from the provided code
# Then run:
node startup.js
```

This will:
- Create all necessary directories
- Generate placeholder images for development
- Create a default .env file if it doesn't exist
- Fix the database.js configuration
- Create a database initialization script

### 2. Fix Database Models

The main issue is with how MySQL parameters are handled in the `Product-brand-models.js` and `Product.js` files.

Replace the following files with the fixed versions:

- `models/Product-brand-models.js` - Fixed handling of LIMIT/OFFSET with db.query()
- `models/Product.js` - Fixed handling of LIMIT/OFFSET
- `models/Brand.js` - Fixed module exports

### 3. Add Missing EJS Templates

Make sure these templates are in place with the provided fixed versions:

- `views/home.ejs`
- `views/error.ejs`
- `views/search.ejs`
- `views/layout.ejs`
- `views/layout-with-container.ejs`
- `views/brands/index.ejs`
- `views/brands/detail.ejs`
- `views/products/index.ejs`
- `views/products/detail.ejs`
- `views/user/dashboard.ejs`
- `views/user/profile.ejs`
- `views/user/wishlist.ejs`
- `views/user/change-password.ejs`
- `views/user/withdraw.ejs`
- `views/auth/login.ejs`
- `views/auth/register.ejs`
- `views/auth/forgot-password.ejs`
- `views/auth/forgot-password-success.ejs`
- `views/auth/reset-password.ejs`
- `views/auth/reset-success.ejs`
- `views/auth/verify-email.ejs`
- `views/auth/verify-result.ejs`

### 4. Initialize the Database

After fixing all code issues, initialize the database:

```bash
node scripts/init-database.js
```

This script:
- Creates the database if it doesn't exist
- Creates all necessary tables
- Adds sample data (brands, products, test user)

### 5. Start the Application

Now you can start the application:

```bash
npm start
# or
node app.js
```

## Additional Troubleshooting

### MySQL Connection Issues

If you encounter MySQL connection issues:

1. Check your .env file has correct database credentials
2. Make sure MySQL is running
3. Try connecting to MySQL manually to verify access
4. If you get "Incorrect arguments to mysqld_stmt_execute", check that you're using db.query() instead of db.execute() for LIMIT and OFFSET parameters

### EJS Template Errors

If you see EJS template errors:

1. Make sure all directories exist
2. Verify the templates follow proper EJS syntax
3. Check that all referenced variables in templates have null/undefined checks
4. If you get "Could not find matching close tag for '<%='", ensure all template tags are properly closed
5. Avoid using template literals within EJS templates as they can cause syntax issues

### Missing Images

If images don't display:

1. Create a placeholder `public/images/default-avatar.png`
2. Create brand logos in `public/images/brands/` directory
3. Add product images in `public/images/products/` directory
4. Create icon images in `public/images/icons/` directory
5. The startup.js script should help generate placeholder SVGs for development

### Routes Not Found

If routes are not found:

1. Check that all route files are properly exported and imported in app.js
2. Verify the order of middleware and routes in app.js
3. Make sure route paths match what's used in the templates

## Key Files Fixed

Here's a summary of the key files that were fixed:

1. **models/Product-brand-models.js**
   - Fixed the way LIMIT and OFFSET parameters are passed to MySQL queries
   - Changed db.execute() to db.query() for numeric parameters

2. **models/Product.js**
   - Fixed the same LIMIT/OFFSET issue
   - Ensured consistent error handling

3. **Database Setup**
   - Fixed config/database.js to properly configure MySQL connection
   - Added proper initialization script

4. **EJS Templates**
   - Fixed syntax issues in all templates
   - Added proper error handling and null checks

5. **Directory Structure**
   - Ensured all required directories exist
   - Added placeholder files for development

## Test User

After initialization, you can log in with:
- Username: testuser
- Password: password123

- Username: admin
- Password: admin123
## Creating Your Own Templates

If you need to create additional templates:

1. Use the existing templates as references
2. Always include null checks for all variables: `<% if (variable) { %>`
3. Prefer simple HTML structure over complex nested EJS includes
4. Keep template logic simple; put complex logic in routes

## Database Schema

The application uses these main tables:

- users: User accounts and authentication
- brands: Brand information including cashback percentages
- products: Product listings with prices and cashback
- user_transactions: Record of cashback earnings 
- user_wishlists: Saved products

Refer to the init-database.js script for the complete schema details.

## Customization

To customize the application:

1. Edit the .env file to change database and email settings
2. Modify public/css/styles.css to change the appearance
3. Update app.js to add new routes or middleware
4. Create new model methods as needed

## Conclusion

After following these steps, the MOVA web application should be fixed and running properly. The app provides a mobile-first experience for cashback shopping with the same interface on desktop browsers.

If you encounter any other issues, check the console logs for specific error messages and refer to the source code in this guide.