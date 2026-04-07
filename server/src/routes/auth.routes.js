import express from "express";
import {
  register,
  login,
  getCurrentUser,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/auth.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validation.js";
import { body } from "express-validator";

const router = express.Router();

router.post("/register", validateRegister, handleValidationErrors, register);
router.post("/login", validateLogin, handleValidationErrors, login);
router.get("/me", authMiddleware, getCurrentUser);

// Refresh token endpoint
router.post(
  "/refresh-token",
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
  handleValidationErrors,
  refreshAccessToken,
);

// Logout endpoint
router.post("/logout", authMiddleware, logout);

// Password reset endpoints
router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("Valid email is required"),
  handleValidationErrors,
  forgotPassword,
);

router.post(
  "/reset-password",
  body("token").notEmpty().withMessage("Reset token is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
  resetPassword,
);

// Email verification endpoints
router.post(
  "/verify-email",
  body("token").notEmpty().withMessage("Verification token is required"),
  handleValidationErrors,
  verifyEmail,
);

router.post(
  "/resend-verification-email",
  authMiddleware,
  resendVerificationEmail,
);

export default router;
