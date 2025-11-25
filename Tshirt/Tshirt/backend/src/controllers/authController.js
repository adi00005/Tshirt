import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

// @desc    Send OTP for signup
// @route   POST /api/auth/send-otp
// @access  Public
export const sendSignupOTP = asyncHandler(async (req, res) => {
  const { email, name, password } = req.body;

  // Validate input
  if (!email || !name || !password) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create temporary user
  const tempUser = new User({
    name,
    email,
    password,
    isActive: false
  });

  // Generate and save OTP
  const otp = tempUser.generateOTP();
  await tempUser.save({ validateBeforeSave: false });

  try {
    // Log the OTP in development
    console.log('Generated OTP for', email, ':', otp);
    
    // For testing, we'll just log to console
    console.log('Skipping email in development. OTP is:', otp);
    
    res.status(200).json({
      success: true,
      message: 'OTP generated successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Only send OTP in response for development
      userId: tempUser._id
    });
  } catch (error) {
    console.error('Error in OTP process:', {
      message: error.message,
      stack: error.stack,
      email,
      name,
      error: error.toString()
    });
    
    // Clean up the temporary user
    if (tempUser && tempUser._id) {
      await User.findByIdAndDelete(tempUser._id).catch(e => 
        console.error('Error cleaning up temp user:', e)
      );
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to process OTP. Please try again.',
      // Only include error details in development
      ...(process.env.NODE_ENV === 'development' && {
        details: error.message,
        stack: error.stack
      })
    });
  }
});

// @desc    Verify OTP and complete registration
// @route   POST /api/auth/verify-signup-otp
// @access  Public
export const verifyOTPAndRegister = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  console.log('Verifying OTP for user:', { userId, otp: otp ? '******' : 'not provided' });

  // Input validation
  if (!userId || !otp) {
    console.log('Missing required fields:', { userId: !!userId, otp: !!otp });
    return res.status(400).json({
      success: false,
      message: 'User ID and OTP are required',
      field: !userId ? 'userId' : 'otp'
    });
  }

  // Validate OTP format (6 digits)
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(otp)) {
    console.log('Invalid OTP format');
    return res.status(400).json({
      success: false,
      message: 'Invalid OTP format. Please enter a 6-digit code.',
      field: 'otp'
    });
  }

  try {
    // Find the temporary user with unexpired OTP
    const user = await User.findOne({
      _id: userId,
      isActive: false,
      otp: { $exists: true },
      otpExpire: { $gt: Date.now() }
    });

    if (!user) {
      console.log('User not found or OTP expired');
      // Check if user exists but OTP is expired
      const expiredUser = await User.findOne({
        _id: userId,
        isActive: false,
        otp: { $exists: true }
      });

      if (expiredUser) {
        // OTP expired, clean up
        expiredUser.otp = undefined;
        expiredUser.otpExpire = undefined;
        await expiredUser.save({ validateBeforeSave: false });
        console.log('Expired OTP cleaned up for user:', userId);
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.',
        code: 'OTP_EXPIRED'
      });
    }

    // Verify OTP
    const isMatch = await user.matchOTP(otp);
    console.log('OTP match result:', isMatch);

    if (!isMatch) {
      console.log('Invalid OTP provided');
      // Track failed attempts
      user.otpAttempts = (user.otpAttempts || 0) + 1;
      await user.save({ validateBeforeSave: false });
      
      const remainingAttempts = 5 - user.otpAttempts;
      
      if (remainingAttempts <= 0) {
        // Too many failed attempts, invalidate OTP
        user.otp = undefined;
        user.otpExpire = undefined;
        user.otpAttempts = 0;
        await user.save({ validateBeforeSave: false });
        
        return res.status(400).json({
          success: false,
          message: 'Too many failed attempts. Please request a new OTP.',
          code: 'TOO_MANY_ATTEMPTS'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
        code: 'INVALID_OTP',
        remainingAttempts
      });
    }

    // OTP verified successfully, activate the user
    user.isActive = true;
    user.emailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    user.otpAttempts = 0;
    
    await user.save({ validateBeforeSave: false });
    console.log('User activated successfully:', user.email);

    // Generate JWT token
    const token = generateToken(user._id);

    // Set HTTP-only cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      emailVerified: user.emailVerified,
      token
    };

    console.log('User registration completed successfully');
    
    res.status(200).json({
      success: true,
      message: 'Registration successful!',
      user: userData
    });

  } catch (error) {
    console.error('Error during OTP verification:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration. Please try again.'
    });
  }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Find the temporary user
  const user = await User.findOne({ 
    email,
    isActive: false,
    emailVerified: false 
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No pending registration found for this email. Please sign up again.'
    });
  }

  try {
    // Generate new OTP
    const newOtp = user.generateOTP();
    await user.save({ validateBeforeSave: false });

    // In development, log the OTP
    if (process.env.NODE_ENV === 'development') {
      console.log('New OTP for', email, ':', newOtp);
      console.log('Skipping email in development');
    }

    res.status(200).json({
      success: true,
      message: 'New OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? newOtp : undefined
    });

  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend OTP. Please try again.'
    });
  }
});

// Basic register endpoint used by the current frontend signup form
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, email and password'
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  const user = await User.create({
    name,
    email,
    password,
    isActive: true,
    emailVerified: true
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email: identifier, password } = req.body;

  try {
    console.log('Login attempt for:', identifier);
    
    // Determine if the identifier is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    // Find user by email or username
    const user = await User.findOne({
      [isEmail ? 'email' : 'name']: identifier
    }).select('+password');

    if (!user) {
      console.log('User not found:', identifier);
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    console.log('User found, checking password...');
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email/username or password'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('Account not active:', user.email);
      return res.status(403).json({
        success: false,
        message: 'Account is not active. Please contact support.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate token
    const token = generateToken(user._id);

    // Return user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      avatar: user.avatar
    };

    console.log('Login successful for user:', user.email);
    
    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      input: { identifier }
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      profile: user.profile,
      addresses: user.addresses,
      preferences: user.preferences,
      privacy: user.privacy,
    }
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    res.status(404);
    throw new Error('No user found with that email');
  }

  // Generate reset token
  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email sent' 
    });
  } catch (err) {
    console.error('Error sending email:', err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(500);
    throw new Error('Email could not be sent');
  }
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid token or token has expired');
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate token
  const token = jwt.sign(
    { id: user._id, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

  res.status(200).json({
    success: true,
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin
    }
  });
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    name,
    email,
    password,
    profile = {},
    addresses,
    preferences = {},
    privacy = {}
  } = req.body;

  if (name) user.name = name;
  if (email) user.email = email;
  if (password) user.password = password;

  user.profile = {
    ...user.profile?.toObject?.() ?? user.profile,
    ...profile,
  };

  if (Array.isArray(addresses)) {
    user.addresses = addresses.map((address) => ({
      ...address,
      addressId: address.addressId || address.id || new mongoose.Types.ObjectId().toString(),
    }));

    if (!user.addresses.some((addr) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }
  }

  user.preferences = {
    ...user.preferences?.toObject?.() ?? user.preferences,
    ...preferences,
  };

  user.privacy = {
    ...user.privacy?.toObject?.() ?? user.privacy,
    ...privacy,
  };

  const updatedUser = await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      profile: updatedUser.profile,
      addresses: updatedUser.addresses,
      preferences: updatedUser.preferences,
      privacy: updatedUser.privacy,
    }
  });
});