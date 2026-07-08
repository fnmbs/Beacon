import nodemailer from "nodemailer";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Email Verification - MAPU Campus Navigation",
    html: `
      <h2>Welcome to MAPU Campus Navigation!</h2>
      <p>Your email verification code is:</p>
      <h1 style="letter-spacing: 8px; font-size: 36px; text-align: center; background: #f5f5f5; padding: 20px; border-radius: 8px; font-family: monospace;">${code}</h1>
      <p>Enter this code in the app to verify your email address.</p>
      <p>This code will expire in 24 hours.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    `,
  };
  console.log(email, code);
  console.log(mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info({
      message: "Verification email sent",
      to: email,
      response: info.response,
      accepted: info.accepted,
    });
    return { success: true };
  } catch (error) {
    logger.error({
      message: "Email verification error",
      to: email,
      error: error.message,
    });
    throw new Error("Failed to send verification email");
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset - MAPU Campus Navigation",
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Use the code below to reset it:</p>
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; border-radius: 8px; margin: 20px 0;">
        ${token}
      </div>
      <p>Enter this code in the app along with your new password.</p>
      <p>This code will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error({
      message: "Password reset email error",
      error: error.message,
    });
    throw new Error("Failed to send password reset email");
  }
};

export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    logger.info("Email service connected successfully");
    return true;
  } catch (error) {
    logger.error({
      message: "Email service connection failed",
      error: error.message,
    });
    return false;
  }
};

export default transporter;
