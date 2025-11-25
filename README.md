# 👕 T-Shirt Store - Complete E-Commerce Application

A full-stack T-shirt customization and e-commerce platform built with React and Node.js.

## 🚀 Features

### Frontend (React)
- **Homepage** with featured products display
- **Shop Page** with category filters (Men, Women, Kids, Sale)
- **Advanced Customize Page** with native HTML5 Canvas
- **Cart Functionality** with header integration
- **Responsive Design** with professional UI

### Customize Page Features
- Interactive T-shirt canvas with native HTML5 Canvas
- Text editor with font selection, size control, color picker
- Image upload with drag-and-drop functionality
- T-shirt color customization with visual feedback
- Real-time price calculation based on design complexity

### Backend (Node.js/Express)
- RESTful API with CORS configuration
- Image upload endpoint using Multer (5MB limit)
- Dynamic pricing calculator API
- Featured products API with fallback mock data
- Robust error handling and fallback data

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI Framework
- **React Router DOM 7.8.0** - Navigation
- **Axios 1.11.0** - HTTP Client
- **HTML5 Canvas** - T-shirt Design Interface

### Backend
- **Node.js** - Runtime Environment
- **Express 5.1.0** - Web Framework
- **MongoDB 6.18.0** - Database
- **Mongoose 8.17.1** - ODM
- **Multer 2.0.2** - File Upload
- **CORS 2.8.5** - Cross-Origin Resource Sharing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Git

### Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=4999
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tshirt_shop
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend Setup
```bash
cd frontend/frontend
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```
Server runs on: http://localhost:4999

### Start Frontend Server
```bash
cd frontend/frontend
npm start
```
Frontend runs on: http://localhost:3000

## 📊 Database Schema

### Product Model
```javascript
{
  name: String (required),
  price: Number (required),
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: [String],
  image_url: String (required),
  is_featured: Boolean,
  stock_quantity: Number,
  category_id: ObjectId,
  // ... more fields
}
```

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/featured` | Get featured products |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| POST | `/api/upload/image` | Upload image |
| POST | `/api/upload/calculate-price` | Calculate design price |

## 🎨 Customize Page Features

### Text Editor
- Font family selection (Arial, Helvetica, Times New Roman, etc.)
- Font size slider (12-72px)
- Color picker for text color
- Bold and italic styling
- Real-time text updates

### Image Upload
- Drag and drop functionality
- File size limit: 5MB
- Supported formats: JPG, PNG, GIF
- Image positioning and resizing

### T-shirt Customization
- Color selection with visual feedback
- Size selection (XS to XXL)
- Design area overlay
- Real-time price updates

## 💰 Pricing Structure

- **Base Price**: ₹2999
- **Text Addition**: +₹10 per character (max ₹300)
- **Image Upload**: +₹500
- **Complex Design** (Image + Text): Additional complexity pricing

## 🔧 Configuration

### MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create new cluster
3. Add IP address to whitelist (`0.0.0.0/0` for development)
4. Get connection string
5. Update `.env` file

### CORS Configuration
Backend supports multiple frontend ports:
- http://localhost:3000
- http://localhost:3001
- http://localhost:3002

## 🛡️ Error Handling

### Fallback System
- Application continues running when MongoDB is unavailable
- Mock data serves as fallback for all endpoints
- Graceful error handling with user-friendly messages

### Validation
- Input validation using Mongoose schemas
- File upload validation (size, type)
- Order validation middleware

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Update CORS origins for production URLs
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build production bundle: `npm run build`
2. Deploy to Netlify, Vercel, or similar platforms
3. Update API base URL for production

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimized
- Professional color scheme (#4A69E2, #FFA500)
- Clean navigation and user experience

## 🔄 Data Flow

```
Frontend (React) → Backend (Node.js) → MongoDB Atlas
     ↓                    ↓                ↓
Port 3000           Port 4999        Cloud Database
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Troubleshooting

### MongoDB Connection Issues
- Verify IP whitelist in MongoDB Atlas
- Check connection string format
- Ensure network connectivity

### Frontend Build Issues
- Clear node_modules and reinstall
- Check Node.js version compatibility
- Verify all dependencies are installed

### Canvas Issues
- Ensure browser supports HTML5 Canvas
- Check for JavaScript errors in console
- Verify image upload file formats

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check existing documentation
- Review error logs for debugging

---

**Built with ❤️ using React, Node.js, and MongoDB**