import pool from "../config/db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

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
    console.error("Error creating refresh token:", error);
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
    console.error("Error verifying refresh token:", error);
    throw new Error("Refresh token verification failed");
  }
};

// Revoke a refresh token
export const revokeRefreshToken = async (token) => {
  try {
    await pool.query("DELETE FROM refresh_tokens WHERE token = $1", [token]);
  } catch (error) {
    console.error("Error revoking refresh token:", error);
  }
};

// Revoke all refresh tokens for a user
export const revokeAllUserRefreshTokens = async (userId) => {
  try {
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [userId]);
  } catch (error) {
    console.error("Error revoking user refresh tokens:", error);
  }
};

// Create password reset token
export const createPasswordResetToken = async (userId) => {
  const token = generateSecureToken();
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
    console.error("Error creating password reset token:", error);
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
    console.error("Error verifying password reset token:", error);
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
    console.error("Error revoking password reset token:", error);
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
    console.error("Error creating email verification token:", error);
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
    console.error("Error verifying email verification token:", error);
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
    console.error("Error revoking email verification token:", error);
  }
};
