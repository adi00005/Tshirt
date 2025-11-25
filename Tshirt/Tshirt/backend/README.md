# T-Shirt Shop Backend

A robust and scalable backend for the T-Shirt Shop e-commerce platform, built with Node.js, Express, and MongoDB. This backend provides a complete set of RESTful APIs for user authentication, product management, order processing, and admin functionality.

## 🚀 Features

- **User Authentication**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Password reset via email
  - Email verification

- **Product Management**
  - CRUD operations for products
  - Product categories and filtering
  - Image upload and management
  - Inventory tracking

- **Order Processing**
  - Shopping cart functionality
  - Order creation and management
  - Payment integration (Stripe/PayPal)
  - Order status tracking

- **Admin Dashboard**
  - User management
  - Product management
  - Order management
  - Sales analytics
  - Inventory management

- **Security**
  - Helmet for security headers
  - Rate limiting
  - Data sanitization
  - XSS protection
  - HPP protection
  - CORS configuration

- **Monitoring & Maintenance**
  - Health check endpoints
  - Request logging
  - Error tracking
  - Database backups
  - Process management with PM2

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher) or yarn
- PM2 (for production)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/tshirt-shop-backend.git
cd tshirt-shop-backend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and add the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/tshirt-shop
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:3000

# Admin User (optional, will use defaults if not set)
ADMIN_EMAIL=admin@tshirtshop.com
ADMIN_PASSWORD=Admin@123

# Email Configuration (for password reset, etc.)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-email-password
SMTP_FROM_NAME=T-Shirt Shop

# File Upload
MAX_FILE_UPLOAD=2
FILE_UPLOAD_PATH=./public/uploads

# Other
NODE_ENV=development
```

### 4. Start the development server

```bash
npm run dev
# or
yarn dev
```

### 5. Set up admin user

```bash
npm run setup:admin
```

## 🏗️ Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── scripts/          # Utility scripts
├── uploads/          # File uploads (created automatically)
├── utils/            # Utility functions
├── .env              # Environment variables
├── .eslintrc.js      # ESLint configuration
├── .gitignore        # Git ignore file
├── ecosystem.config.js # PM2 configuration
├── package.json      # Project dependencies
└── README.md         # This file
```

## 🚀 Production Deployment

### 1. Install PM2 globally

```bash
npm install -g pm2
```

### 2. Start the application in production mode

```bash
# Build the application
npm run build

# Start the application with PM2
npm run pm2:start:prod

# Save the PM2 process list
pm2 save

# Generate startup script (for auto-start on server reboot)
pm2 startup

# Save the PM2 process list and set up startup
pm2 save && pm2 startup
```

### 3. Monitor the application

```bash
# View logs
npm run pm2:logs

# View application status
pm2 status

# Monitor application
pm2 monit
```

## 🔒 Security Best Practices

1. Always use HTTPS in production
2. Keep dependencies up to date
3. Use environment variables for sensitive data
4. Implement rate limiting
5. Use Helmet for security headers
6. Sanitize user input
7. Use parameterized queries
8. Implement proper error handling
9. Use HTTP-only cookies for JWT
10. Regularly backup your database

## 📊 Monitoring & Maintenance

### Health Check

```bash
GET /api/health
```

### Database Backup

To create a manual backup:

```bash
npm run backup:db
```

For automated backups, set up a cron job:

```bash
# Edit crontab
crontab -e

# Add this line to run backup daily at 2 AM
0 2 * * * cd /path/to/backend && /usr/bin/node scripts/backupDatabase.js >> /var/log/tshirt-backup.log 2>&1
```

### Monitoring Script

Start the monitoring script:

```bash
npm run monitor
```

## 🐳 Docker Support

### Development

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Production

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/)
- [PM2](https://pm2.keymetrics.io/)
- [Nodemailer](https://nodemailer.com/about/)
