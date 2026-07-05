import express from "express";
import {
  scheduleCourse,
  getUserTimetable,
  getTimetableByCourses,
  downloadTimetable,
} from "../controllers/timetable.controllers.js";

const router = express.Router();

router.post("/", scheduleCourse);
router.get("/user/:userId", getUserTimetable);
router.get("/by-courses", getTimetableByCourses);
router.get("/download/:userId", downloadTimetable);

export default router;
