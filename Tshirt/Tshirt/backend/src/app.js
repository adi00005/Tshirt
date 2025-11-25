// src/app.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Import models so Mongoose knows them before routes are used
import "./models/Category.js";
import "./models/Product.js";
import "./models/Order.js";
import "./models/Cart.js";
import "./models/Design.js";  // Import the Design model

// Import routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminProductRoutes from "./routes/adminProductRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import designRoutes from "./routes/designRoutes.js";  // Import design routes

const app = express();

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',  // For development
    'http://127.0.0.1:3001'   // For development
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Content-Disposition'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposedHeaders: ['set-cookie', 'Content-Disposition']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/cart", cartRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
