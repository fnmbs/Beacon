import * as User from "../models/user.models.js";
import logger from "../utils/logger.js";
import { catchAsync, AppError } from "../middleware/errorHandler.js";
import {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  createPasswordResetToken,
  verifyPasswordResetToken,
  revokePasswordResetToken,
  createEmailVerificationToken,
  verifyEmailVerificationToken,
  revokeEmailVerificationToken,
} from "../utils/tokenService.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

export const register = catchAsync(async (req, res) => {
  const { email, password, fullName } = req.body;

  try {
    const user = await User.createUser(email, password, fullName);
    const token = User.generateToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    // Create email verification token
    const verificationToken = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken);

    logger.info({
      message: "User registered successfully",
      userId: user.id,
      email: user.email,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          isEmailVerified: user.is_email_verified,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error({
      message: "Registration error",
      error: error.message,
    });

    if (error.message.includes("already exists")) {
      throw new AppError("Email already registered", 400);
    }
    throw new AppError(error.message || "Registration failed", 500);
  }
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);
    if (!user) {
      logger.warn({
        message: "Login failed - user not found",
        email,
        ip: req.ip,
      });
      throw new AppError("Invalid email or password", 401);
    }

    const isPasswordValid = await User.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn({
        message: "Login failed - invalid password",
        email,
        ip: req.ip,
      });
      throw new AppError("Invalid email or password", 401);
    }

    const token = User.generateToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    logger.info({
      message: "User logged in successfully",
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          isEmailVerified: user.is_email_verified,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    if (error.isOperational) throw error;

    logger.error({
      message: "Login error",
      error: error.message,
    });
    throw new AppError(error.message || "Login failed", 500);
  }
});

export const getCurrentUser = catchAsync(async (req, res) => {
  const user = await User.findUserById(req.user.id);

  if (!user) {
    logger.warn({
      message: "Current user not found",
      userId: req.user.id,
    });
    throw new AppError("User not found", 404);
  }

  return res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isEmailVerified: user.is_email_verified,
      },
    },
  });
});

// Refresh token endpoint
export const refreshAccessToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  try {
    const userId = await verifyRefreshToken(refreshToken);
    const user = await User.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const newAccessToken = User.generateToken(user.id, user.email, user.role);
    const newRefreshToken = await createRefreshToken(user.id);

    logger.info({
      message: "Access token refreshed",
      userId: user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.warn({
      message: "Token refresh failed",
      error: error.message,
    });
    throw new AppError(error.message || "Failed to refresh access token", 401);
  }
});

// Logout controller (revoke refresh token)
export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }

    logger.info({
      message: "User logged out",
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    logger.error({
      message: "Logout error",
      error: error.message,
    });
    throw new AppError("Logout failed", 500);
  }
});

// Request password reset
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findUserByEmail(email);

    // Don't reveal if user exists
    if (!user) {
      logger.warn({
        message: "Password reset requested for non-existent user",
        email,
      });
      return res.status(200).json({
        success: true,
        message: "If email exists, password reset link has been sent",
      });
    }

    const resetToken = await createPasswordResetToken(user.id);
    await sendPasswordResetEmail(user.email, resetToken);

    logger.info({
      message: "Password reset email sent",
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link has been sent to your email",
    });
  } catch (error) {
    logger.error({
      message: "Forgot password error",
      error: error.message,
    });
    throw new AppError(
      error.message || "Failed to process password reset",
      500,
    );
  }
});

// Reset password with token
export const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    throw new AppError("Token and new password are required", 400);
  }

  try {
    const userId = await verifyPasswordResetToken(token);
    const user = await User.updatePassword(userId, newPassword);
    await revokePasswordResetToken(token);

    // Revoke all existing refresh tokens for security
    await revokeAllUserRefreshTokens(userId);

    logger.info({
      message: "Password reset successfully",
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully. Please login again.",
    });
  } catch (error) {
    logger.warn({
      message: "Password reset failed",
      error: error.message,
    });
    throw new AppError(
      error.message || "Failed to reset password",
      error.message.includes("expired") ? 400 : 401,
    );
  }
});

// Verify email with token
export const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError("Verification token is required", 400);
  }

  try {
    const userId = await verifyEmailVerificationToken(token);
    const user = await User.verifyEmail(userId);
    await revokeEmailVerificationToken(token);

    logger.info({
      message: "Email verified successfully",
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          isEmailVerified: user.is_email_verified,
        },
      },
    });
  } catch (error) {
    logger.warn({
      message: "Email verification failed",
      error: error.message,
    });
    throw new AppError(
      error.message || "Failed to verify email",
      error.message.includes("expired") ? 400 : 401,
    );
  }
});

// Resend verification email
export const resendVerificationEmail = catchAsync(async (req, res) => {
  const userId = req.user.id;
  console.log("Resend verification email for user ID:", userId);

  try {
    console.log("HI")
    const user = await User.findUserById(userId);
    console.log("HI")

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.is_email_verified) {
      throw new AppError("Email is already verified", 400);
    }

    const verificationToken = await createEmailVerificationToken(userId);
    await sendVerificationEmail(user.email, verificationToken);

    logger.info({
      message: "Verification email resent",
      userId: user.id,
      email: user.email,
    });

    return res.status(200).json({
      success: true,
      message: "Verification email has been resent",
    });
  } catch (error) {
    logger.error({
      message: "Resend verification email error",
      error: error.message,
      userId,
    });
    throw new AppError(error.message || "Failed to resend email", 500);
  }
});
