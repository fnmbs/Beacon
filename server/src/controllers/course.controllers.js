import * as Course from "../models/course.models.js";
import pool from "../config/db.js";

const VALID_TYPES = ["elective", "compulsory"];
const VALID_SEMESTERS = ["harmattan", "rain"];
const VALID_LEVELS = [100, 200, 300, 400, 500, 600, 700];
const VALID_CREDITS = [1, 2, 3, 4, 5, 6];

const createCourses = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      facultyId,
      departmentId,
      level,
      credits,
      semester,
      type,
    } = req.body;

    if (
      !code ||
      !name ||
      !facultyId ||
      !departmentId ||
      !level ||
      !semester ||
      !type ||
      !description ||
      !credits
    ) {
      return res.status(400).json({
        success: false,
        message:
          "code, name, facultyId, departmentId, level, credits, semester and type are required",
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    if (!VALID_SEMESTERS.includes(semester)) {
      return res.status(400).json({
        success: false,
        message: `Invalid semester. Must be one of: ${VALID_SEMESTERS.join(", ")}`,
      });
    }

    if (!VALID_LEVELS.includes(Number(level))) {
      return res.status(400).json({
        success: false,
        message: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}`,
      });
    }

    if (!VALID_CREDITS.includes(Number(credits))) {
      return res.status(400).json({
        success: false,
        message: `Invalid credits. Must be one of: ${VALID_CREDITS.join(", ")}`,
      });
    }

    //check if course already exist
    const ifCourseExists = await Course.ifCourseExists(name, code);

    if (ifCourseExists) {
      return res.status(409).json({
        success: false,
        message: "A course with same name of code already exists",
      });
    }

    //create the course
    const course = await Course.createCourse(
      code,
      name,
      description,
      facultyId,
      departmentId,
      level,
      credits,
      semester,
      type,
    );

    return res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.getCourseById(id);

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Course fetched successfuly",
      data: course,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getLecturersTeachingCourse = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Course ID is required",
      });
    }

    const lecturers = await Course.getLecturerTeachingCourse(id);

    return res.status(200).json({
      success: true,
      message:
        lecturers.length > 0
          ? "Lecturers fetched successfully"
          : "No lecturers found",
      lecturers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const assignLecturers = async (req, res) => {
  try {
    const { lecturer_ids } = req.body;
    const { id } = req.params;

    if (
      !lecturer_ids ||
      !Array.isArray(lecturer_ids) ||
      lecturer_ids.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "lecturer_ids must be  not be empty and must be an array",
      });
    }

    // check course exists
    const course = await Course.getCourseById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // check all lecturers exist
    const lecturers = await pool.query(
      `SELECT id FROM lecturers WHERE id = ANY($1)`,
      [lecturer_ids],
    );

    if (lecturers.rowCount !== lecturer_ids.length) {
      return res.status(404).json({
        success: false,
        message: "One or more lecturers not found",
      });
    }

    // filter out already assigned
    const existing = await pool.query(
      `SELECT lecturer_id FROM course_lecturers WHERE course_id = $1 AND lecturer_id = ANY($2)`,
      [id, lecturer_ids],
    );
    const alreadyAssigned = existing.rows.map((r) => r.lecturer_id);
    const toAssign = lecturer_ids.filter(
      (lid) => !alreadyAssigned.includes(lid),
    );

    if (toAssign.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All lecturers are already assigned to this course",
      });
    }

    // bulk insert
    const values = toAssign.map((lid) => `('${id}', '${lid}')`).join(", ");
    await pool.query(
      `INSERT INTO course_lecturers (course_id, lecturer_id) VALUES ${values}`,
    );

    res.status(201).json({
      success: true,
      message: `${toAssign.length} lecturer(s) assigned to course`,
      skipped: alreadyAssigned.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    //check if course exist

    const course = await Course.getCourseById(id);

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not exist",
      });
    }

    //course found, delete
    const deletedCourse = await Course.deleteCourse(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
      data: deletedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      faculty_id,
      department_id,
      level,
      credits,
      semester,
      type,
      is_active,
    } = req.body;

    if (
      !code ||
      !name ||
      !faculty_id ||
      !department_id ||
      !level ||
      !semester ||
      !type ||
      !description ||
      !credits ||
      !is_active
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}`,
      });
    }

    if (!VALID_SEMESTERS.includes(semester)) {
      return res.status(400).json({
        success: false,
        message: `Invalid semester. Must be one of: ${VALID_SEMESTERS.join(", ")}`,
      });
    }

    if (!VALID_LEVELS.includes(Number(level))) {
      return res.status(400).json({
        success: false,
        message: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}`,
      });
    }

    if (!VALID_CREDITS.includes(Number(credits))) {
      return res.status(400).json({
        success: false,
        message: `Invalid credits. Must be one of: ${VALID_CREDITS.join(", ")}`,
      });
    }

    const course = await Course.getCourseById(id);

    if (!course) {
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }

    //update course
    const updatedCourse = await Course.updateCourse(
      id,
      code,
      name,
      description,
      faculty_id,
      department_id,
      level,
      credits,
      semester,
      type,
      is_active,
    );

    return res.status(200).json({
      success: true,
      message: "Course successfully updated",
      data: updatedCourse,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { courses, total } = await Course.getAllCourses(limit, offset);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${total} courses found`,
      courses,
      totalCourses: total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCoursesByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { courses, total } = await Course.getCoursesByDepartment(
      departmentId,
      limit,
      offset,
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this department",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${total} courses found`,
      courses,
      totalCourses: total,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const searchCourses = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "query is required",
      });
    }

    const courses = await Course.searchCourses(query);

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${courses.length} courses found`,
      courses,
      totalCourses: courses.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  updateCourse,
  deleteCourse,
  createCourses,
  getCourseById,
  getLecturersTeachingCourse,
  assignLecturers,
  getAllCourses,
  getCoursesByDepartment,
  searchCourses,
};
