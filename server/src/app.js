import express from "express";
import cors from "cors";
import helmet from "helmet";
import locationRoutes from "./routes/location.routes.js";
import pathRoutes from "./routes/path.routes.js";
import navigationRoutes from "./routes/navigation.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import departmentRoutes from "./routes/department.routes.js";
import lecturerRoutes from "./routes/lecturer.routes.js";
import courseRoutes from "./routes/course.routes.js";
import timetableRoutes from "./routes/timetable.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import campusRoutes from "./routes/campus.routes.js";
import quickDestinationRoutes from "./routes/quickDestination.routes.js";
import {
  testDatabase,
  checkUsersTable,
} from "./controllers/test.controllers.js";
// import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";
import {
  requestLogger,
  globalErrorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// ==================== SECURITY & LOGGING MIDDLEWARE ====================
// Security headers
app.use(helmet());

// CORS - restrict to frontend only in production
// allow multiple origins dynamically
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging
app.use(requestLogger);

// Apply rate limiter to all API routes
// app.use(
//   "/api/v1/",
//   apiLimiter
// );

//
app.get("/api/v1/test/db", testDatabase);
app.get("/api/v1/test/users-table", checkUsersTable);

//
app.use(
  "/api/v1/auth",
  // authLimiter,
  authRoutes,
);
app.use(
  "/api/v1/admin/auth",
  // authLimiter,
  adminAuthRoutes,
);

//
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/paths", pathRoutes);
app.use("/api/v1/navigation", navigationRoutes);
app.use("/api/v1/faculties", facultyRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/lecturers", lecturerRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/timetable", timetableRoutes);
app.use("/api/v1/notes", notesRoutes);
app.use("/api/v1/campus", campusRoutes);
app.use("/api/v1/quick-destinations", quickDestinationRoutes);

// ==================== ERROR HANDLING ====================
// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
