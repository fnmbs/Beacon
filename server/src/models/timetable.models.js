import pool from "../config/db.js";

const checkConflict = async (location_id, day, start_time, end_time) => {
  const res = await pool.query(
    `SELECT 1 FROM timetable WHERE location_id = $1 AND day = $2 AND NOT ($3 >= end_time OR $4 <= start_time)`,
    [location_id, day, start_time, end_time],
  );
  return res.rowCount
};

const scheduleCourse = async (
  course_id,
  location_id,
  day,
  start_time,
  end_time,
) => {
  const res = await pool.query(
    `INSERT INTO timetable (course_id, location_id, day, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `,
    [course_id, location_id, day, start_time, end_time],
  );

  return res.rows[0];
};

const getTimetableByCourseIds = async (courseIds) => {
  if (!courseIds || courseIds.length === 0) return [];
  const res = await pool.query(
    `SELECT t.*, c.code AS course_code, c.name AS course_name, c.credits, l.name AS location_name
     FROM timetable t
     JOIN courses c ON c.id = t.course_id
     JOIN locations l ON l.id = t.location_id
     WHERE t.course_id = ANY($1::uuid[])
     ORDER BY t.day, t.start_time`,
    [courseIds],
  );
  return res.rows;
};

const getAllTimetableEntries = async () => {
  const res = await pool.query(
    `SELECT t.*, c.code AS course_code, c.name AS course_name, l.name AS location_name
     FROM timetable t
     JOIN courses c ON c.id = t.course_id
     JOIN locations l ON l.id = t.location_id
     ORDER BY t.day, t.start_time`,
  );
  return res.rows;
};

const deleteTimetableEntry = async (id) => {
  const res = await pool.query(
    `DELETE FROM timetable WHERE id = $1 RETURNING *`,
    [id],
  );
  return res.rows[0] || null;
};

const updateTimetableEntry = async (id, location_id, day, start_time, end_time) => {
  const res = await pool.query(
    `UPDATE timetable SET location_id = $1, day = $2, start_time = $3, end_time = $4 WHERE id = $5 RETURNING *`,
    [location_id, day, start_time, end_time, id],
  );
  return res.rows[0] || null;
};

const checkConflictExcludeId = async (location_id, day, start_time, end_time, exclude_id) => {
  const res = await pool.query(
    `SELECT 1 FROM timetable WHERE location_id = $1 AND day = $2 AND id != $5 AND NOT ($3 >= end_time OR $4 <= start_time)`,
    [location_id, day, start_time, end_time, exclude_id],
  );
  return res.rowCount;
};

export { checkConflict, scheduleCourse, getTimetableByCourseIds, getAllTimetableEntries, deleteTimetableEntry, updateTimetableEntry, checkConflictExcludeId };
