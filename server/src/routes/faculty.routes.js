import express from "express";
import {
  createFaculty,
  getAllFaculties,
  removeFaculty,
  updateFaculty,
  getDepartmentsInFaculty,
  getAllLecturers,
  searchFaculties,
  getFacultyById,
} from "../controllers/faculty.controllers.js";

const router = express.Router();

router.get("/", getAllFaculties);
router.post("/", createFaculty);
router.get("/search", searchFaculties);
router.get("/:facultyId/lecturers", getAllLecturers);
router.get("/:facultyId/departments", getDepartmentsInFaculty);
router.put("/:facultyId", updateFaculty);
router.get("/:facultyId", getFacultyById);
router.delete("/:facultyId", removeFaculty);

export default router;
