import * as Admin from "../models/admin.models.js";
import { generateToken } from "../utils/jwt.js";
import logger from "../utils/logger.js";
import { catchAsync, AppError } from "../middleware/errorHandler.js";

export const registerAdmin = catchAsync(async (req, res) => {
  const { email, password, fullName, privileges } = req.body;

  try {
    const existing = await Admin.findAdminByEmail(email);
    if (existing) {
      throw new AppError("Email already registered", 400);
    }

    const admin = await Admin.createAdmin(
      email,
      password,
      fullName,
      privileges,
    );
    const token = generateToken(admin.id, admin.email, "admin");

    logger.info({
      message: "Admin registered",
      adminId: admin.id,
      email: admin.email,
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          privileges: admin.privileges,
        },
        token,
      },
    });
  } catch (error) {
    logger.error({ message: "Admin registration error", error: error.message });
    if (error.isOperational) throw error;
    throw new AppError(error.message || "Registration failed", 500);
  }
});

export const loginAdmin = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findAdminByEmail(email);
    if (!admin) {
      logger.warn({ message: "Admin login failed - not found", email });
      throw new AppError("Invalid email or password", 401);
    }

    const valid = await Admin.verifyAdminPassword(password, admin.password);
    if (!valid) {
      logger.warn({ message: "Admin login failed - invalid password", email });
      throw new AppError("Invalid email or password", 401);
    }

    const token = generateToken(admin.id, admin.email, "admin");

    logger.info({
      message: "Admin logged in",
      adminId: admin.id,
      email: admin.email,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          privileges: admin.privileges,
        },
        token,
      },
    });
  } catch (error) {
    if (error.isOperational) throw error;
    logger.error({ message: "Admin login error", error: error.message });
    throw new AppError(error.message || "Login failed", 500);
  }
});

export const getCurrentAdmin = catchAsync(async (req, res) => {
  const admin = await Admin.findAdminById(req.user.id);
  if (!admin) throw new AppError("Admin not found", 404);

  return res.status(200).json({
    success: true,
    data: {
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.full_name,
        privileges: admin.privileges,
        role: admin.role,
      },
    },
  });
});
