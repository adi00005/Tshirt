import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import logger from './logger.js';

const isDevelopment = process.env.NODE_ENV !== 'production';

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

// Set refresh token if available
if (process.env.GOOGLE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });
}

// Create a test account for development
const createTestAccount = async () => {
  if (isDevelopment) {
    const testAccount = await nodemailer.createTestAccount();
    logger.info('Ethereal test account created');
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
      },
    };
  }
  return null;
};

// Create a transporter with retry mechanism
const createTransporter = async () => {
  // Development configuration
  if (isDevelopment) {
    const testAccount = await createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      isTestAccount: true
    };
  }

  // Production configuration with OAuth2
  try {
    const accessToken = await oauth2Client.getAccessToken();
    
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_FROM,
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      }),
      isTestAccount: false
    };
  } catch (error) {
    logger.error('Failed to create OAuth2 client, falling back to SMTP', error);
    
    // Fallback to SMTP if OAuth2 fails
    return {
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_FROM,
          pass: process.env.SMTP_PASSWORD,
        },
      }),
      isTestAccount: false
    };
  }
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
    logger.error(`Error loading email template ${templateName}:`, error);
    throw new Error(`Failed to load email template: ${error.message}`);
  }
};

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
  try {
    const { transporter, isTestAccount } = await createTransporter();
    
    const emailContent = await loadTemplate('otp', {
      name,
      otp,
      appName: process.env.APP_NAME || 'Tshirt Store',
      year: new Date().getFullYear()
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Tshirt Store'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `Your OTP for ${process.env.APP_NAME || 'Tshirt Store'}`,
      html: emailContent
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isTestAccount) {
      logger.info('Test email sent:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Generic email sender
const sendEmail = async (options) => {
  try {
    const { transporter, isTestAccount } = await createTransporter();
    
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Tshirt Store'}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (isTestAccount) {
      logger.info('Test email sent:', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

// For testing in development
const getTestAccount = async () => {
  if (isDevelopment) {
    const testAccount = await nodemailer.createTestAccount();
    return {
      email: testAccount.user,
      password: testAccount.pass,
      smtpUrl: `smtp://${testAccount.user}:${testAccount.pass}@smtp.ethereal.email:587`,
      webUrl: nodemailer.getTestMessageUrl({ messageId: 'test' })
    };
  }
  return null;
};

export default {
  sendEmail,
  sendOTPEmail,
  getTestAccount
};
