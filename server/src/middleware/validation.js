import { body, validationResult } from "express-validator";
import logger from "../utils/logger.js";

export const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain uppercase, lowercase, and number (optional for dev)",
    ),
  body("fullName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Full name must be at least 2 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Full name can only contain letters and spaces"),
];

export const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn({
      message: "Validation error",
      errors: errors.array(),
      path: req.path,
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};
