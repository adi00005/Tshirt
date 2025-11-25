import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema(
  {
    addressId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString()
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
    country: { type: String, default: 'India' },
    phone: { type: String, default: '' }
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, default: '' },
    bio: { type: String, default: '' },
    profilePicture: { type: String, default: '' }
  },
  { _id: false }
);

const preferenceSchema = new mongoose.Schema(
  {
    preferredSize: { type: String, default: '' },
    favoriteColors: { type: [String], default: [] },
    newsletter: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: false }
  },
  { _id: false }
);

const privacySchema = new mongoose.Schema(
  {
    profileVisibility: { type: String, default: 'private' },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false
    },
    profile: {
      type: profileSchema,
      default: () => ({})
    },
    addresses: {
      type: [addressSchema],
      default: () => ([{
        type: 'home',
        isDefault: true,
        country: 'India'
      }])
    },
    preferences: {
      type: preferenceSchema,
      default: () => ({})
    },
    privacy: {
      type: privacySchema,
      default: () => ({})
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: false
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    otp: {
      type: String,
      select: false
    },
    otpExpire: {
      type: Date,
      select: false
    },
    otpAttempts: {
      type: Number,
      default: 0,
      select: false
    },
    lastLogin: {
      type: Date
    },
    avatar: {
      type: String,
      default: 'default.jpg'
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error matching passwords:', error);
    return false;
  }
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Generate and hash OTP
userSchema.methods.generateOTP = function() {
  try {
    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // Log OTP for development
    
    // Hash OTP and set expiration to 10 minutes
    this.otp = crypto.createHash('sha256').update(otp).digest('hex');
    this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otpAttempts = 0; // Reset attempts counter
    
    // Return plain OTP for testing/email purposes
    return otp;
  } catch (error) {
    console.error('Error generating OTP:', error);
    throw new Error('Failed to generate OTP');
  }
};

// Match OTP
userSchema.methods.matchOTP = async function(enteredOTP) {
  try {
    if (!enteredOTP || !this.otp) {
      console.log('No OTP provided or OTP not set');
      return false;
    }
    
    // Check if OTP is expired
    if (this.otpExpire < Date.now()) {
      console.log('OTP has expired');
      return false;
    }
    
    // Check if too many failed attempts
    if (this.otpAttempts >= 5) {
      console.log('Too many OTP attempts');
      // Invalidate OTP after too many failed attempts
      this.otp = undefined;
      this.otpExpire = undefined;
      this.otpAttempts = 0;
      await this.save({ validateBeforeSave: false });
      return false;
    }
    
    // Hash the entered OTP and compare with stored hash
    const hashedEnteredOTP = crypto
      .createHash('sha256')
      .update(enteredOTP)
      .digest('hex');
      
    const isMatch = this.otp === hashedEnteredOTP;
    console.log('OTP match result:', isMatch);
    
    // Increment attempts counter if OTP doesn't match
    if (!isMatch) {
      this.otpAttempts += 1;
      await this.save({ validateBeforeSave: false });
    }
    
    return isMatch;
  } catch (error) {
    console.error('Error matching OTP:', error);
    return false;
  }
};

// Clear OTP data
userSchema.methods.clearOTP = async function() {
  this.otp = undefined;
  this.otpExpire = undefined;
  this.otpAttempts = 0;
  await this.save({ validateBeforeSave: false });
};

const User = mongoose.model('User', userSchema);

export default User;
