import pool from "../config/db.js";

const ifDepartmentExists = async (name, code, email) => {
  const res = await pool.query(
    `SELECT 1 FROM departments WHERE name = $1 OR code = $2 OR email = $3`,
    [name, code, email],
  );

  return res.rowCount > 0;
};

const createDepartment = async (
  name,
  code,
  email,
  buildingId,
  facultyId,
  headId,
) => {
  const res = await pool.query(
    `INSERT INTO departments( name, code, email, building_id, faculty_id, head_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, code, email, buildingId ?? null, facultyId ?? null, headId ?? null],
  );

  return res.rows[0];
};

const getDepartmentById = async (id) => {
  const res = await pool.query(
    `SELECT 
      d.*,
      f.name AS faculty_name,
      loc.name AS building_name
    FROM departments d
    LEFT JOIN faculties f ON f.id = d.faculty_id
    LEFT JOIN locations loc ON loc.id = d.building_id
    WHERE d.id = $1`,
    [id],
  );
  console.log(res);

  return res.rows[0];
};

const deleteDepartment = async (id) => {
  const res = await pool.query(
    `DELETE FROM departments WHERE id = $1 RETURNING *`,
    [id],
  );

  return res.rows[0];
};

const updateDepartment = async (
  id,
  name,
  code,
  email,
  buildingId,
  facultyId,
  headId,
) => {
  const res = await pool.query(
    `UPDATE departments SET name=$1, code=$2, email=$3, building_id=$4, faculty_id=$5, head_id=$6 WHERE id=$7 RETURNING *`,
    [
      name,
      code,
      email,
      buildingId ?? null,
      facultyId ?? null,
      headId ?? null,
      id,
    ],
  );

  const updatedDept = res.rows[0];

  return updatedDept;
};

const getAllDepartments = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const res = await pool.query(
      `SELECT 
        d.id,
        d.faculty_id,
        d.code,
        d.email,
        d.head_id,
        d.name,
        d.building_id,
        f.name AS faculty_name,
        loc.name AS building_name
      FROM departments d
      LEFT JOIN faculties f ON f.id = d.faculty_id
      LEFT JOIN locations loc ON loc.id = d.building_id
      ORDER BY d.name ASC
      LIMIT $1 OFFSET $2`,
      [limit, offset],
    );

    const countRes = await pool.query(`SELECT COUNT(*) FROM departments`);

    return {
      departments: res.rows,
      total: parseInt(countRes.rows[0].count),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getLecturers = async (id, limit, offset) => {
  const res = await pool.query(
    `SELECT 
    l.*,
    d.name AS department_name,
    f.name AS faculty_name
    FROM lecturers l
    LEFT JOIN departments d ON d.id = l.department_id
    LEFT JOIN faculties f ON f.id = d.faculty_id
    WHERE l.department_id = $1
    ORDER BY l.name ASC
    LIMIT $2 OFFSET $3`,
    [id, limit, offset],
  );

  const count = await pool.query(
    `SELECT COUNT(*) FROM lecturers WHERE department_id = $1`,
    [id],
  );

  return {
    lecturers: res.rows,
    total: parseInt(count.rows[0].count),
  };
};

const searchDepartments = async (query) => {
  try {
    const res = await pool.query(
      `SELECT 
        d.id,
        d.faculty_id,
        d.code,
        d.email,
        d.head_id,
        d.name,
        d.building_id,
        f.name AS faculty_name,
        loc.name AS building_name
      FROM departments d
      LEFT JOIN faculties f ON f.id = d.faculty_id
      LEFT JOIN locations loc ON loc.id = d.building_id
      WHERE d.name ILIKE $1 OR d.code ILIKE $1 OR d.email ILIKE $1
      ORDER BY d.name ASC`,
      [`%${query}%`],
    );

    return res.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getDepartmentsByFaculty = async (facultyId, page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const res = await pool.query(
      `SELECT 
        d.id,
        d.faculty_id,
        d.code,
        d.email,
        d.head_id,
        d.name,
        d.building_id,
        f.name AS faculty_name,
        loc.name AS building_name
      FROM departments d
      LEFT JOIN faculties f ON f.id = d.faculty_id
      LEFT JOIN locations loc ON loc.id = d.building_id
      WHERE d.faculty_id = $1
      ORDER BY d.name ASC
      LIMIT $2 OFFSET $3`,
      [facultyId, limit, offset],
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM departments WHERE faculty_id = $1`,
      [facultyId],
    );

    return {
      departments: res.rows,
      total: parseInt(countRes.rows[0].count),
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  ifDepartmentExists,
  createDepartment,
  getDepartmentById,
  deleteDepartment,
  updateDepartment,
  getAllDepartments,
  getLecturers,
  searchDepartments,
  getDepartmentsByFaculty,
};
