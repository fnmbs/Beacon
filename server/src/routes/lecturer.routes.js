import express from "express";
import {
  createLecturer,
  getAllLecturers,
  getLecturerById,
  getTimetableForLecturer,
  searchLecturers,
  deleteLecturer,
  updateLecturer,
} from "../controllers/lecturer.controllers.js";

const router = express.Router();

router.post("/", createLecturer);
router.get("/", getAllLecturers);
router.get("/search", searchLecturers);
router.get("/:id", getLecturerById);
router.delete("/:id", deleteLecturer);
router.put("/:id", updateLecturer);
router.get("/:id/timetable", getTimetableForLecturer);

export default router;
