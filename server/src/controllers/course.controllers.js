import * as Course from "../models/course.models.js";
import * as Student from "../models/student.models.js";
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
      eligible_levels,
      credits,
      semester,
      type,
    } = req.body;

    if (!code || !name || !facultyId || !departmentId || !semester || !type || !credits) {
      return res.status(400).json({
        success: false,
        message: "code, name, facultyId, departmentId, credits, semester and type are required",
      });
    }

    // validate levels: allow either a single `level` or an array `eligible_levels`
    if (eligible_levels) {
      if (!Array.isArray(eligible_levels) || eligible_levels.length === 0) {
        return res.status(400).json({
          success: false,
          message: "eligible_levels must be a non-empty array if provided",
        });
      }
      for (const l of eligible_levels) {
        if (!VALID_LEVELS.includes(Number(l))) {
          return res.status(400).json({
            success: false,
            message: `Invalid level in eligible_levels. Must be one of: ${VALID_LEVELS.join(", ")}`,
          });
        }
      }
    } else {
      if (!level) {
        return res.status(400).json({
          success: false,
          message: "Either level or eligible_levels is required",
        });
      }
      if (!VALID_LEVELS.includes(Number(level))) {
        return res.status(400).json({
          success: false,
          message: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}`,
        });
      }
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

    // level validation handled above (either single level or eligible_levels array)

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

    // create the course (pass eligible_levels when provided)
    const courseLevel = level || (eligible_levels && eligible_levels.length > 0 ? Math.min(...eligible_levels.map(Number)) : null);
    const course = await Course.createCourse(
      code,
      name,
      description,
      facultyId,
      departmentId,
      courseLevel,
      eligible_levels,
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

const getEligibleCourses = async (req, res) => {
  try {
    const { departmentId, level } = req.query;

    if (!departmentId || !level) {
      return res.status(400).json({
        success: false,
        message: "departmentId and level query params are required",
      });
    }

    const courses = await Course.getEligibleCoursesByDeptAndLevel(
      departmentId,
      Number(level),
    );

    const compulsory = courses.filter((c) => c.type === "compulsory");
    const elective = courses.filter((c) => c.type === "elective");

    return res
      .status(200)
      .json({ success: true, data: { compulsory, elective } });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getUserCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const profile = await Student.getStudentProfileByUserId(userId);

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "No student profile found",
        courses: [],
      });
    }

    const eligible = await Course.getEligibleCoursesByDeptAndLevel(
      profile.department_id,
      Number(profile.level),
    );
    const compulsoryIds = eligible
      .filter((c) => c.type === "compulsory")
      .map((c) => c.id);

    const courseIds = [
      ...compulsoryIds,
      ...(profile.chosen_elective_course_ids || []),
    ];

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No courses assigned",
        courses: [],
      });
    }

    const result = await pool.query(
      `SELECT c.*, d.name AS department_name, f.name AS faculty_name
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       JOIN faculties f ON f.id = d.faculty_id
       WHERE c.id = ANY($1)
       ORDER BY c.name ASC`,
      [courseIds],
    );

    await Student.assignCompulsoryCourses(userId, compulsoryIds);

    return res.status(200).json({
      success: true,
      message: "Courses fetched successfully",
      courses: result.rows,
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
    const values = toAssign
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");
    const params = toAssign.flatMap((lid) => [id, lid]);
    await pool.query(
      `INSERT INTO course_lecturers (course_id, lecturer_id) VALUES ${values}`,
      params,
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
      eligible_levels,
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
      !semester ||
      !type ||
      !credits ||
      typeof is_active === "undefined"
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
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

    // validate levels for update
    if (eligible_levels) {
      if (!Array.isArray(eligible_levels) || eligible_levels.length === 0) {
        return res.status(400).json({
          success: false,
          message: "eligible_levels must be a non-empty array if provided",
        });
      }
      for (const l of eligible_levels) {
        if (!VALID_LEVELS.includes(Number(l))) {
          return res.status(400).json({
            success: false,
            message: `Invalid level in eligible_levels. Must be one of: ${VALID_LEVELS.join(", ")}`,
          });
        }
      }
    } else {
      if (!level) {
        return res.status(400).json({
          success: false,
          message: "Either level or eligible_levels is required",
        });
      }
      if (!VALID_LEVELS.includes(Number(level))) {
        return res.status(400).json({
          success: false,
          message: `Invalid level. Must be one of: ${VALID_LEVELS.join(", ")}`,
        });
      }
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
    const courseLevel = level || (eligible_levels && eligible_levels.length > 0 ? Math.min(...eligible_levels.map(Number)) : null);
    const updatedCourse = await Course.updateCourse(
      id,
      code,
      name,
      description,
      faculty_id,
      department_id,
      courseLevel,
      eligible_levels,
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
  getEligibleCourses,
  getUserCourses,
  assignLecturers,
  getAllCourses,
  getCoursesByDepartment,
  searchCourses,
};
