import pool from "../config/db.js";
import crypto from "crypto";
import logger from "./logger.js";

// Generate a secure random token
export const generateSecureToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Create refresh token and store in database
export const createRefreshToken = async (userId) => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt],
    );
    return token;
  } catch (error) {
    logger.error({ message: "Error creating refresh token", error: error.message });
    throw new Error("Failed to create refresh token");
  }
};

// Verify refresh token exists and is not expired
export const verifyRefreshToken = async (token) => {
  try {
    const result = await pool.query(
      "SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid or expired refresh token");
    }

    return result.rows[0].user_id;
  } catch (error) {
    logger.error({ message: "Error verifying refresh token", error: error.message });
    throw new Error("Refresh token verification failed");
  }
};

// Revoke a refresh token
export const revokeRefreshToken = async (token) => {
  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  } catch (error) {
    logger.error({ message: "Error revoking refresh token", error: error.message });
  }
};

// Revoke all refresh tokens for a user
export const revokeAllUserRefreshTokens = async (userId) => {
  try {
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  } catch (error) {
    logger.error({ message: "Error revoking user refresh tokens", error: error.message });
  }
};

// Create password reset token
export const createPasswordResetToken = async (userId) => {
  const token = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  try {
    // Delete any existing reset tokens for this user
    await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1", [
      userId,
    ]);

    // Create new reset token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt],
    );
    return token;
  } catch (error) {
    logger.error({ message: "Error creating password reset token", error: error.message });
    throw new Error("Failed to create password reset token");
  }
};

// Verify password reset token
export const verifyPasswordResetToken = async (token) => {
  try {
    const result = await pool.query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid or expired password reset token");
    }

    return result.rows[0].user_id;
  } catch (error) {
    logger.error({ message: "Error verifying password reset token", error: error.message });
    throw new Error("Password reset token verification failed");
  }
};

// Revoke password reset token after use
export const revokePasswordResetToken = async (token) => {
  try {
    await pool.query("DELETE FROM password_reset_tokens WHERE token = $1", [
      token,
    ]);
  } catch (error) {
    logger.error({ message: "Error revoking password reset token", error: error.message });
  }
};

// Create email verification token
export const createEmailVerificationToken = async (userId) => {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  try {
    // Delete any existing verification tokens for this user
    await pool.query(
      "DELETE FROM email_verification_tokens WHERE user_id = $1",
      [userId],
    );

    // Create new verification token
    await pool.query(
      "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, token, expiresAt],
    );
    return token;
  } catch (error) {
    logger.error({ message: "Error creating email verification token", error: error.message });
    throw new Error("Failed to create email verification token");
  }
};

// Verify email verification token
export const verifyEmailVerificationToken = async (token) => {
  try {
    const result = await pool.query(
      "SELECT user_id FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()",
      [token],
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid or expired verification token");
    }

    return result.rows[0].user_id;
  } catch (error) {
    logger.error({ message: "Error verifying email verification token", error: error.message });
    throw new Error("Email verification token verification failed");
  }
};

// Revoke email verification token after use
export const revokeEmailVerificationToken = async (token) => {
  try {
    await pool.query("DELETE FROM email_verification_tokens WHERE token = $1", [
      token,
    ]);
  } catch (error) {
    logger.error({ message: "Error revoking email verification token", error: error.message });
  }
};

// Generate a 6-digit verification code
export const generateVerificationCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

// Create email change verification code with pending email
export const createEmailChangeCode = async (userId, pendingEmail) => {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await pool.query(
      "DELETE FROM email_verification_tokens WHERE user_id = $1 AND type = 'email_change'",
      [userId],
    );
    await pool.query(
      "INSERT INTO email_verification_tokens (user_id, token, expires_at, type, pending_email) VALUES ($1, $2, $3, 'email_change', $4)",
      [userId, code, expiresAt, pendingEmail],
    );
    return code;
  } catch (error) {
    logger.error({ message: "Error creating email change code", error: error.message });
    throw new Error("Failed to create email change code");
  }
};

// Verify email change code
export const verifyEmailChangeCode = async (code) => {
  try {
    const result = await pool.query(
      "SELECT user_id, pending_email FROM email_verification_tokens WHERE token = $1 AND type = 'email_change' AND expires_at > NOW()",
      [code],
    );
    if (result.rows.length === 0) {
      throw new Error("Invalid or expired verification code");
    }
    return { userId: result.rows[0].user_id, pendingEmail: result.rows[0].pending_email };
  } catch (error) {
    logger.error({ message: "Error verifying email change code", error: error.message });
    throw new Error("Email verification failed");
  }
};

// Create email verification code (6 digits)
export const createEmailVerificationCode = async (userId) => {
  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    await pool.query(
      "DELETE FROM email_verification_tokens WHERE user_id = $1",
      [userId],
    );
    await pool.query(
      "INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, code, expiresAt],
    );
    return code;
  } catch (error) {
    logger.error({ message: "Error creating email verification code", error: error.message });
    throw new Error("Failed to create email verification code");
  }
};

// Verify email verification code
export const verifyEmailVerificationCode = async (code) => {
  try {
    const result = await pool.query(
      "SELECT user_id FROM email_verification_tokens WHERE token = $1 AND expires_at > NOW()",
      [code],
    );
    if (result.rows.length === 0) {
      throw new Error("Invalid or expired verification code");
    }
    return result.rows[0].user_id;
  } catch (error) {
    logger.error({ message: "Error verifying email verification code", error: error.message });
    throw new Error("Email verification failed");
  }
};
