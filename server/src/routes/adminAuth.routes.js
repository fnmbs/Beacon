import express from "express";
import { body } from "express-validator";
import {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin,
} from "../controllers/adminAuth.controllers.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { handleValidationErrors } from "../middleware/validation.js";

const router = express.Router();

router.post(
  "/register",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  handleValidationErrors,
  registerAdmin,
);

router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
  loginAdmin,
);

router.get("/me", authMiddleware, getCurrentAdmin);

export default router;
