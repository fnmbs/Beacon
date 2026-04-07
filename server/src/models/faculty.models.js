import pool from "../config/db.js";

const ifFacultyExists = async (name, code, email) => {
  const res = await pool.query(
    `SELECT 1 FROM faculties WHERE name = $1 OR code = $2 OR email = $3`,
    [name, code, email],
  );

  return res.rowCount > 0;
};

const getFacultyById = async (facultyId) => {
  const res = await pool.query(
    `SELECT 
      f.*,
      loc.name AS building_name
    FROM faculties f
    LEFT JOIN locations loc ON loc.id = f.building_id
    WHERE f.id = $1`,
    [facultyId],
  );

  return res.rows[0] ? res.rows[0] : null;
};

const facultyExists = async (facultyId) => {
  const res = await pool.query(`SELECT 1 FROM faculties WHERE id = $1`, [
    facultyId,
  ]);

  return res.rowCount > 0;
};

const removeFaculty = async (facultyId) => {
  const res = await pool.query(
    `DELETE FROM faculties WHERE id = $1 RETURNING *`,
    [facultyId],
  );

  console.log(res.rows);

  return res.rows[0];
};

const updateFaculty = async (
  facultyId,
  name,
  code,
  email,
  buildingId,
  establishedYear,
) => {
  const res = await pool.query(
    `UPDATE faculties SET name=$1, code=$2, email=$3, building_id=$4, established_year=$5 WHERE id=$6 RETURNING *`,
    [name, code, email, buildingId ?? null, establishedYear ?? null, facultyId],
  );

  return res.rows[0];
};

const createFaculty = async (
  name,
  code,
  email,
  buildingId,
  establishedYear,
) => {
  const res = await pool.query(
    `INSERT INTO faculties(name, code, email, building_id, established_year) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [name, code, email, buildingId ?? null, establishedYear ?? null],
  );

  return res.rows[0];
};

const getAllFaculties = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const res = await pool.query(
    `SELECT 
      f.*,
      loc.name AS building_name
    FROM faculties f
    LEFT JOIN locations loc ON loc.id = f.building_id
    ORDER BY f.name ASC
    LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  const countRes = await pool.query(`SELECT COUNT(*) FROM faculties`);

  return {
    faculties: res.rows,
    total: parseInt(countRes.rows[0].count),
  };
};

const searchFaculties = async (query) => {
  const res = await pool.query(
    `SELECT 
      f.*,
      loc.name AS building_name
    FROM faculties f
    LEFT JOIN locations loc ON loc.id = f.building_id
    WHERE f.name ILIKE $1 OR f.code ILIKE $1 OR f.email ILIKE $1
    ORDER BY f.name ASC`,
    [`%${query}%`],
  );

  return {
    faculties: res.rows,
    total: res.rows.length,
  };
};

const getDepartmentsInFaculty = async (facultyId) => {
  const res = await pool.query(
    `SELECT id, name, code FROM departments WHERE faculty_id = $1`,
    [facultyId],
  );

  return res.rows;
};

const getAllLecturers = async (facultyId, limit, offset) => {
  const res = await pool.query(
    `SELECT 
  l.*,
  d.name AS department_name,
  f.name AS faculty_name
FROM lecturers l
JOIN departments d ON d.id = l.department_id
JOIN faculties f ON f.id = d.faculty_id
WHERE d.faculty_id = $1
ORDER BY l.name ASC
LIMIT $2 OFFSET $3`,
    [facultyId, limit, offset],
  );

  const count = await pool.query(
    `SELECT COUNT(*) FROM lecturers l
     JOIN departments d ON d.id = l.department_id
     WHERE d.faculty_id = $1`,
    [facultyId],
  );

  return {
    lecturers: res.rows,
    total: parseInt(count.rows[0].count),
  };
};

export {
  ifFacultyExists,
  createFaculty,
  getFacultyById,
  facultyExists,
  removeFaculty,
  updateFaculty,
  getAllFaculties,
  searchFaculties,
  getDepartmentsInFaculty,
  getAllLecturers,
};
