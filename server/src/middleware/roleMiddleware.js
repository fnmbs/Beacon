import { AppError } from "./errorHandler.js";
import { logger } from "./logger.js";

// Define role hierarchy
const roleHierarchy = {
  admin: { level: 3, permissions: ["read", "write", "delete", "manage_users"] },
  lecturer: { level: 2, permissions: ["read", "write"] },
  user: { level: 1, permissions: ["read"] },
  student: { level: 1, permissions: ["read"] },
};

// Middleware to check if user has required role(s)
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // User should already be authenticated via authMiddleware
      if (!req.user) {
        logger.warn("Unauthorized access attempt - no user in request");
        throw new AppError("Unauthorized", 401);
      }

      const userRole = req.user.role || "user";
      const isAuthorized = allowedRoles.includes(userRole);

      if (!isAuthorized) {
        logger.warn(
          `Forbidden access - User ${req.user.email} (${userRole}) attempted to access admin resource`,
        );
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(", ")}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user has required permission
export const requirePermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("Unauthorized access attempt - no user in request");
        throw new AppError("Unauthorized", 401);
      }

      const userRole = req.user.role || "user";
      const roleInfo = roleHierarchy[userRole];

      if (!roleInfo) {
        logger.warn(`Invalid role: ${userRole}`);
        throw new AppError("Invalid user role", 400);
      }

      const hasPermission = roleInfo.permissions.includes(requiredPermission);

      if (!hasPermission) {
        logger.warn(
          `Permission denied - User ${req.user.email} (${userRole}) lacks permission: ${requiredPermission}`,
        );
        throw new AppError(
          `Permission denied. Required permission: ${requiredPermission}`,
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user can access their own resource or is admin
export const requireOwnerOrAdmin = (paramName = "userId") => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        logger.warn("Unauthorized access attempt - no user in request");
        throw new AppError("Unauthorized", 401);
      }

      const resourceUserId = req.params[paramName];
      const isAdmin = req.user.role === "admin";
      const isOwner = req.user.id.toString() === resourceUserId?.toString();

      if (!isAdmin && !isOwner) {
        logger.warn(
          `Forbidden access - User ${req.user.id} attempted to access resource owned by ${resourceUserId}`,
        );
        throw new AppError(
          "Access denied. You can only access your own resources",
          403,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Get role hierarchy
export const getRoleHierarchy = () => roleHierarchy;

// Check if one role can access another role's resources (hierarchically)
export const hasHigherOrEqualRole = (userRole, requiredRole) => {
  const userLevel = roleHierarchy[userRole]?.level || 0;
  const requiredLevel = roleHierarchy[requiredRole]?.level || 0;
  return userLevel >= requiredLevel;
};
