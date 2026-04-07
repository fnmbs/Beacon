import pool from "../config/db.js";

const ifCourseExists = async (name, code) => {
  const res = await pool.query(
    `SELECT 1 FROM courses WHERE name = $1 OR code = $2`,
    [name, code],
  );

  return res.rowCount > 0;
};

const createCourse = async (
  code,
  name,
  description,
  facultyId,
  departmentId,
  level,
  credits,
  semester,
  type,
) => {
  const res = await pool.query(
    `INSERT INTO courses(code,name,description,faculty_id,department_id,level,credits,semester,type) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [
      code,
      name,
      description,
      facultyId,
      departmentId,
      level,
      credits ?? 3,
      semester,
      type,
    ],
  );

  return res.rows[0];
};

const getCourseById = async (id) => {
  const res = await pool.query(
    `SELECT
        c.*,
        d.name AS department_name,
        f.name AS faculty_name
       FROM courses c
       JOIN departments d ON d.id = c.department_id
       JOIN faculties f ON f.id = d.faculty_id
       WHERE c.id = $1`,
    [id],
  );

  return res.rows[0];
};

const getLecturerTeachingCourse = async (id) => {
  const res = await pool.query(
    `SELECT l.*
       FROM lecturers l
       JOIN course_lecturers cl ON cl.lecturer_id = l.id
       WHERE cl.course_id = $1
       ORDER BY l.name ASC`,
    [id],
  );

  return res.rows;
};

const deleteCourse = async (id) => {
  const res = await pool.query(
    `DELETE FROM courses WHERE id = $1 RETURNING *`,
    [id],
  );

  return res.rows[0];
};

const updateCourse = async (
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
) => {
  const res = await pool.query(
    `UPDATE courses SET code = $1, name = $2, description = $3, faculty_id = $4, department_id = $5, level = $6, credits = $7, semester = $8, type = $9, is_active = $10 WHERE id = $11 RETURNING *`,
    [
      code,
      name,
      description ?? null,
      faculty_id,
      department_id,
      level,
      credits,
      semester,
      type,
      is_active,
      id,
    ],
  );

  return res.rows[0];
};

const getAllCourses = async (limit, offset) => {
  const courses = await pool.query(
    `SELECT c.*, d.name AS department_name, f.name AS faculty_name
     FROM courses c
     JOIN departments d ON d.id = c.department_id
     JOIN faculties f ON f.id = d.faculty_id
     ORDER BY c.name ASC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  const total = await pool.query(`SELECT COUNT(*) FROM courses`);

  return {
    courses: courses.rows,
    total: parseInt(total.rows[0].count),
  };
};

const getCoursesByDepartment = async (departmentId, limit, offset) => {
  const courses = await pool.query(
    `SELECT c.*, d.name AS department_name, f.name AS faculty_name
     FROM courses c
     JOIN departments d ON d.id = c.department_id
     JOIN faculties f ON f.id = d.faculty_id
     WHERE c.department_id = $1
     ORDER BY c.name ASC
     LIMIT $2 OFFSET $3`,
    [departmentId, limit, offset],
  );

  const total = await pool.query(
    `SELECT COUNT(*) FROM courses WHERE department_id = $1`,
    [departmentId],
  );

  return {
    courses: courses.rows,
    total: parseInt(total.rows[0].count),
  };
};

const searchCourses = async (query) => {
  const courses = await pool.query(
    `SELECT c.*, d.name AS department_name, f.name AS faculty_name
     FROM courses c
     JOIN departments d ON d.id = c.department_id
     JOIN faculties f ON f.id = d.faculty_id
     WHERE c.name ILIKE $1 OR c.code ILIKE $1
     ORDER BY c.name ASC`,
    [`%${query}%`],
  );

  return courses.rows;
};

export {
  ifCourseExists,
  createCourse,
  getCourseById,
  getLecturerTeachingCourse,
  deleteCourse,
  updateCourse,
  getAllCourses,
  getCoursesByDepartment,
  searchCourses,
};
