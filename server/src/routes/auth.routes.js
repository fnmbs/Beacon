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
  updateStudentElectives,
  updateProfile,
  verifyEmailChange,
  resendEmailChangeCode,
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
router.patch("/me", authMiddleware, updateProfile);
router.put("/me/electives", authMiddleware, updateStudentElectives);

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
  body("code").notEmpty().withMessage("Verification code is required"),
  handleValidationErrors,
  verifyEmail,
);

router.post(
  "/resend-verification-email",
  authMiddleware,
  resendVerificationEmail,
);

// Email change verification
router.post(
  "/verify-email-change",
  authMiddleware,
  body("code").notEmpty().withMessage("Verification code is required"),
  handleValidationErrors,
  verifyEmailChange,
);

router.post(
  "/resend-email-change-code",
  authMiddleware,
  resendEmailChangeCode,
);

export default router;
