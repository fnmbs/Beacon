import express from "express";
import {
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getAllDepartments,
  updateDepartment,
  getLecturers,
  getCourses,
  searchDepartments,
  getDepartmentsByFaculty,
} from "../controllers/department.controllers.js";

const router = express.Router();

router.get("/", getAllDepartments);
router.post("/", createDepartment);
router.get("/search", searchDepartments);
router.get("/faculty/:facultyId", getDepartmentsByFaculty);
router.get("/:id/lecturers", getLecturers);
router.get("/:id/courses", getCourses);
router.put("/:id", updateDepartment);
router.get("/:id", getDepartmentById);
router.delete("/:id", deleteDepartment);

export default router;
