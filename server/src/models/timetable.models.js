import pool from "../config/db.js";

const checkConflict = async (location_id, day, start_time, end_time) => {
  const res = await pool.query(
    `SELECT 1 FROM timetable WHERE location_id = $1 AND day = $2 AND NOT ($3 >= end_time OR $4 <= start_time)`,
    [location_id, day, start_time, end_time],
  );
//   console.log(res.rowCount)

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

export { checkConflict, scheduleCourse };
