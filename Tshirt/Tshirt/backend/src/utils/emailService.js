import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { logInfo, logError } from '../utils/logger.js';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Create a test account for development
const createTestAccount = async () => {
  if (isDevelopment) {
    const testAccount = await nodemailer.createTestAccount();
    logInfo('Ethereal test account created');
    return testAccount;
  }
  return null;
};

// Create a transporter with SMTP configuration
const createTransporter = async () => {
  // Development configuration
  if (isDevelopment) {
    const testAccount = await createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      isTestAccount: true
    };
  }

  // Production configuration with SMTP
  return {
    transporter: nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_FROM,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    }),
    isTestAccount: false
  };
};

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load email template
const loadTemplate = async (templateName, replacements = {}) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', 'emails', `${templateName}.html`);
    let template = await fs.readFile(templatePath, 'utf8');
    
    // Replace placeholders with actual values
    Object.entries(replacements).forEach(([key, value]) => {
      template = template.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    return template;
  } catch (error) {
    logError(`Error loading email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${error.message}`);
  }
};

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
  try {
    const { transporter, isTestAccount } = await createTransporter();
    
    const emailContent = await loadTemplate('otp', {
      name: name || 'User',
      otp,
      appName: process.env.APP_NAME || 'Tshirt Store',
      year: new Date().getFullYear(),
      supportEmail: process.env.SUPPORT_EMAIL || 'support@tshirtstore.com',
      expiryMinutes: 10
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'T-Shirt Store'}" <${process.env.EMAIL_FROM || 'noreply@tshirtstore.com'}>`,
      to: email,
      subject: `Your OTP for ${process.env.APP_NAME || 'Tshirt Store'}`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logInfo('Test email sent. Preview URL:', previewUrl);
      console.log('Preview URL:', previewUrl);
    }
    
    return true;
  } catch (error) {
    logError('Error sending OTP email:', error);
    
    if (isDevelopment) {
      console.log('Using development fallback. OTP:', otp);
      return true;
    }
    
    throw new Error('Failed to send OTP email');
  }
};

// Generic email sender
const sendEmail = async (options) => {
  try {
    const { transporter, isTestAccount } = await createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'T-Shirt Store'}" <${process.env.EMAIL_FROM || 'noreply@tshirtstore.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      logInfo('Test email sent. Preview URL:', previewUrl);
      console.log('Preview URL:', previewUrl);
    }
    
    return info;
  } catch (error) {
    logError('Error sending email:', error);
    
    if (isDevelopment) {
      console.log('Using development fallback. Email not actually sent.');
      return { messageId: 'dev-mode-message-id' };
    }
    
    throw new Error('Failed to send email');
  }
};

export { sendEmail, sendOTPEmail };
