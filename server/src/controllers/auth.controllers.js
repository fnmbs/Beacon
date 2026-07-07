import * as User from "../models/user.models.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";
import * as Student from "../models/student.models.js";
import pool from "../config/db.js";
import * as Course from "../models/course.models.js";
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
  createEmailVerificationCode,
  verifyEmailVerificationCode,
  createEmailChangeCode,
  verifyEmailChangeCode,
} from "../utils/tokenService.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../utils/emailService.js";

export const register = catchAsync(async (req, res) => {
  const {
    email,
    password,
    fullName,
    role,
    level,
    departmentId,
    chosenElectives,
  } = req.body;
  

  try {
    console.log(req.body);
    const user = await User.createUser(email, password, fullName, role);
    // If registering as student, create student profile and auto-assign compulsory courses
    if (role === "student") {
      if (!level || !departmentId) {
        throw new AppError(
          "level and departmentId are required for student registration",
          400,
        );
      }
      const courses = await Course.getEligibleCoursesByDeptAndLevel(
        departmentId,
        Number(level),
      );
      const compulsory = courses.filter((c) => c.type === "compulsory");
      const compulsoryIds = compulsory.map((c) => c.id);
      await Student.createStudentProfile(
        user.id,
        Number(level),
        departmentId,
        chosenElectives || [],
        compulsoryIds,
      );
    }
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    // Create email verification code (6 digits)
    const verificationCode = await createEmailVerificationCode(user.id);
    console.log(`[EMAIL] Verification code for ${user.email}: ${verificationCode}`);
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      sendVerificationEmail(user.email, verificationCode).catch(err =>
        logger.error({ message: "Background email send failed", error: err.message })
      );
    } else {
      logger.warn({ message: "Email not configured — skipping send" });
    }

    logger.info({
      message: "User registered successfully",
      userId: user.id,
      email: user.email,
    });

    // For students, also return eligible compulsory/elective courses for their level+department
    let eligible = null;
    if (role === "student") {
      const courses = await Course.getEligibleCoursesByDeptAndLevel(
        departmentId,
        Number(level),
      );
      eligible = {
        compulsory: courses.filter((c) => c.type === "compulsory"),
        elective: courses.filter((c) => c.type === "elective"),
      };
    }

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
        eligible,
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

    const token = generateToken(user.id, user.email, user.role);
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

  const response = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    isEmailVerified: user.is_email_verified,
  };

  if (user.role === "student") {
    const profile = await Student.getStudentProfileByUserId(user.id);
    response.profile = profile;
  }

  return res.status(200).json({ success: true, data: { user: response } });
});

export const updateStudentElectives = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { chosenElectives } = req.body;

  if (!Array.isArray(chosenElectives)) {
    throw new AppError("chosenElectives must be an array of course ids", 400);
  }

  const updated = await Student.updateChosenElectives(userId, chosenElectives);

  return res.status(200).json({ success: true, data: updated });
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

    const newAccessToken = generateToken(user.id, user.email, user.role);
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

// Verify email with 6-digit code
export const verifyEmail = catchAsync(async (req, res) => {
  const { code } = req.body;

  if (!code) {
    throw new AppError("Verification code is required", 400);
  }

  try {
    const userId = await verifyEmailVerificationCode(code);
    const user = await User.verifyEmail(userId);

    // Generate tokens for auto-login
    const token = generateToken(user.id, user.email, user.role);
    const refreshToken = await createRefreshToken(user.id);

    // Delete used code
    await revokeEmailVerificationToken(code);

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
        token,
        refreshToken,
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

  try {
    const user = await User.findUserById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.is_email_verified) {
      throw new AppError("Email is already verified", 400);
    }

    const verificationCode = await createEmailVerificationCode(userId);
    await sendVerificationEmail(user.email, verificationCode);

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

// Update profile (email)
export const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { email, level, matricNo, phone } = req.body;

  try {
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new AppError("Invalid email format", 400);
      }
      const newEmail = email.trim().toLowerCase();
      const currentUser = await User.findUserById(userId);
      if (!currentUser) {
        throw new AppError("User not found", 404);
      }
      if (newEmail === currentUser.email) {
        throw new AppError("New email is the same as current email", 400);
      }
      // Check new email not already in use by another user
      const existingUser = await User.findUserByEmail(newEmail);
      if (existingUser && existingUser.id !== userId) {
        throw new AppError("Email already in use", 400);
      }
      // Store pending email and send verification code
      await User.updatePendingEmail(userId, newEmail);
      const verificationCode = await createEmailChangeCode(userId, newEmail);
      await sendVerificationEmail(newEmail, verificationCode);
      logger.info({ message: "Email change verification sent", userId });
      return res.status(200).json({
        success: true,
        message: "Verification code sent to new email",
        data: { emailChangePending: true, pendingEmail: newEmail },
      });
    }

    const userRole = req.user.role;
    if (
      userRole === "student" &&
      (level !== undefined || matricNo !== undefined || phone !== undefined)
    ) {
      const studentUpdates = {};
      if (level !== undefined) studentUpdates.level = level;
      if (matricNo !== undefined) studentUpdates.matricNo = matricNo;
      if (phone !== undefined) studentUpdates.phone = phone;
      await Student.updateStudentProfile(userId, studentUpdates);
    }

    const updatedUser = await User.findUserById(userId);
    if (!updatedUser) {
      throw new AppError("User not found", 404);
    }

    const response = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      isEmailVerified: updatedUser.is_email_verified,
    };

    if (updatedUser.role === "student") {
      const profile = await Student.getStudentProfileByUserId(updatedUser.id);
      response.profile = profile;
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: { user: response },
    });
  } catch (error) {
    if (error.message.includes("already exists")) {
      throw new AppError("Email already in use", 400);
    }
    throw new AppError(error.message || "Failed to update profile", 500);
  }
});

// Verify email change with OTP
export const verifyEmailChange = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { code } = req.body;
  if (!code) {
    throw new AppError("Verification code is required", 400);
  }
  try {
    const { userId: tokenUserId, pendingEmail } =
      await verifyEmailChangeCode(code);
    if (tokenUserId !== userId) {
      throw new AppError("Invalid verification code", 401);
    }
    await User.updateEmail(userId, pendingEmail);
    await pool.query(
      "DELETE FROM email_verification_tokens WHERE user_id = $1 AND type = 'email_change'",
      [userId],
    );
    logger.info({
      message: "Email changed successfully",
      userId,
      newEmail: pendingEmail,
    });
    const updatedUser = await User.findUserById(userId);
    const response = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.full_name,
      role: updatedUser.role,
      isEmailVerified: updatedUser.is_email_verified,
    };
    if (updatedUser.role === "student") {
      const profile = await Student.getStudentProfileByUserId(updatedUser.id);
      response.profile = profile;
    }
    return res.status(200).json({
      success: true,
      message: "Email changed successfully",
      data: { user: response },
    });
  } catch (error) {
    throw new AppError(error.message || "Failed to verify email change", 400);
  }
});

// Resend email change verification code
export const resendEmailChangeCode = catchAsync(async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }
    if (!user.pending_email) {
      throw new AppError("No pending email change", 400);
    }
    const verificationCode = await createEmailChangeCode(
      userId,
      user.pending_email,
    );
    await sendVerificationEmail(user.pending_email, verificationCode);
    return res.status(200).json({
      success: true,
      message: "Verification code resent to new email",
    });
  } catch (error) {
    throw new AppError(error.message || "Failed to resend code", 500);
  }
});
