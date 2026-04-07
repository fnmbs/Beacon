import pool from "../config/db.js";

const ifLecturerExists = async (email) => {
  const res = await pool.query(`SELECT FROM lecturers WHERE email = $1`, [
    email,
  ]);

  return res.rowCount > 0;
};

const createLecturer = async (name, email, departmentId) => {
  const res = await pool.query(
    `INSERT INTO lecturers(name, email, department_id) VALUES($1, $2, $3) RETURNING *`,
    [name, email, departmentId],
  );

  return res.rows[0];
};

const getLecturerById = async (id) => {
  const res = await pool.query(`SELECT * FROM lecturers WHERE id = $1`, [id]);

  return res.rows[0];
};

const getAllLecturers = async (limit, offset) => {
  const res = await pool.query(
    `SELECT 
  l.*,
  d.name AS department_name,
  f.name AS faculty_name
FROM lecturers l
LEFT JOIN departments d ON d.id = l.department_id
LEFT JOIN faculties f ON f.id = d.faculty_id
ORDER BY l.name ASC
LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  const count = await pool.query(`SELECT COUNT(*) FROM lecturers`);

  return {
    lecturers: res.rows,
    total: parseInt(count.rows[0].count),
  };
};

const searchLecturers = async (name) => {
  const res = await pool.query(
    `SELECT
  l.id,
  l.name,
  l.email,
  d.name AS department_name,
  f.name AS faculty_name
FROM lecturers l
LEFT JOIN departments d ON d.id = l.department_id
LEFT JOIN faculties f ON f.id = d.faculty_id
WHERE l.name ILIKE $1
ORDER BY l.name ASC
LIMIT 5`,
    [`%${name}%`],
  );
  return res.rows;
};

const getTimetableForLecturer = async (id, day) => {
  const condition = day
    ? `WHERE cl.lecturer_id = $1 AND t.day = $2`
    : `WHERE cl.lecturer_id = $1`;

  const params = day ? [id, day] : [id];

  const res = await pool.query(
    `SELECT
        t.*,
        c.code AS course_code,
        c.name AS course_name,
        l.name AS location_name,
        d.name AS department_name
       FROM timetable t
        JOIN courses c ON c.id = t.course_id
        JOIN course_lecturers cl ON cl.course_id = c.id
        JOIN locations l ON l.id = t.location_id
        JOIN departments d ON d.id = c.department_id
       ${condition}
       ORDER BY t.start_time ASC`,
    params,
  );

  if (day) return res.rows;

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  return DAYS.reduce((acc, d) => {
    acc[d] = res.rows.filter((row) => row.day === d);
    return acc;
  }, {});
};

const deleteLecturer = async (id) => {
  const res = await pool.query(
    `
    DELETE FROM lecturers WHERE id = $1
    RETURNING *
    `,
    [id],
  );

  return res.rows[0]
};

const updateLecturer = async (id, name, email, departmentId) => {
  const res = await pool.query(
    `
    UPDATE lecturers SET name=$1, email=$2, department_id=$3 WHERE id=$4
    RETURNING *
    `,
    [name, email, departmentId, id],
  );

  return res.rows[0]
};
export {
  ifLecturerExists,
  createLecturer,
  getLecturerById,
  getAllLecturers,
  searchLecturers,
  deleteLecturer,
  getTimetableForLecturer,
  updateLecturer
};
