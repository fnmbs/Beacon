import express from "express";

import {
  createCourses,
  getCourseById,
  getLecturersTeachingCourse,
  deleteCourse,
  updateCourse,
  assignLecturers,
  getAllCourses,
  getCoursesByDepartment,
  searchCourses,
} from "../controllers/course.controllers.js";

const router = express.Router();

router.get("/", getAllCourses);
router.post("/", createCourses);
router.get("/search", searchCourses);
router.get("/department/:departmentId", getCoursesByDepartment);
router.get("/:id/lecturers", getLecturersTeachingCourse);
router.post("/:id/lecturers", assignLecturers);
router.get("/:id", getCourseById);
router.delete("/:id", deleteCourse);
router.put("/:id", updateCourse);

export default router;
