import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  sendSignupOTP,
  verifyOTPAndRegister,
  resendOTP
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAuth } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateAuth.register, register);
router.post('/send-signup-otp', validateAuth.sendOtp, sendSignupOTP);
router.post('/verify-signup-otp', validateAuth.verifyOtp, verifyOTPAndRegister);
router.post('/resend-otp', resendOTP);
router.post('/login', validateAuth.login, login);
router.post('/signin', validateAuth.login, login); // Add signin route for frontend compatibility
router.post('/signup', validateAuth.register, register); // Add signup route for frontend compatibility
router.post('/forgotpassword', validateAuth.forgotPassword, forgotPassword);
router.put('/resetpassword/:resettoken', validateAuth.resetPassword, resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);

export default router;
