import express from "express";
import {
  scheduleCourse,
  getUserTimetable,
  getTimetableByCourses,
  downloadTimetable,
  getAllTimetable,
  deleteTimetable,
  updateTimetable,
} from "../controllers/timetable.controllers.js";

const router = express.Router();

router.get("/", getAllTimetable);
router.post("/", scheduleCourse);
router.get("/user/:userId", getUserTimetable);
router.get("/by-courses", getTimetableByCourses);
router.get("/download/:userId", downloadTimetable);
router.put("/:id", updateTimetable);
router.delete("/:id", deleteTimetable);

export default router;
