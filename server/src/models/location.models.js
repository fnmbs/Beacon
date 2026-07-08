import pool from "../config/db.js";

export const getAllLocations = async (page, limit) => {
  const offset = (page - 1) * limit;

  // Fetch paginated locations
  const res = await pool.query(
    `
    SELECT * FROM locations
    ORDER BY name ASC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  // Get total count of locations for pagination info
  const countRes = await pool.query(`SELECT COUNT(*) FROM locations`);
  const totalLocations = parseInt(countRes.rows[0].count, 10);

  return {
    locations: res.rows,
    totalLocations,
    page,
    totalPages: Math.ceil(totalLocations / limit),
  };
};

export const searchLocationsByName = async (name) => {
  const res = await pool.query(
    `SELECT * FROM locations WHERE name ILIKE $1 ORDER BY name ASC`,
    [`%${name}%`]
  );
  return res.rows;
}

export const createLocation = async ({ name, type, latitude, longitude }) => {
  const res = await pool.query(
    `
    INSERT INTO locations(name, type, latitude, longitude) VALUES($1,$2,$3,$4) 
    RETURNING *
    `,
    [name, type, latitude, longitude],
  );
  return res.rows[0];
};

export const getLocationByCoordinates = async ({ latitude, longitude }) => {
  const res = await pool.query(
    `
    SELECT *,
    (
      6371000 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians($1)) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) *
          sin(radians(latitude))
        ))
      )
    ) AS distance
    FROM locations
    WHERE (
      6371000 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians($1)) *
          cos(radians(latitude)) *
          cos(radians(longitude) - radians($2)) +
          sin(radians($1)) *
          sin(radians(latitude))
        ))
      )
    ) < 20
    `,
    [latitude, longitude],
  );

  return res.rows[0] || null;
};

export const getLocationById = async (id) => {
  const res = await pool.query("SELECT * FROM locations WHERE id = $1", [id]);

  return res.rows[0] || null;
};

export const deleteLocation = async (id) => {
  const res = await pool.query(
    "DELETE FROM locations WHERE id = $1 RETURNING *",
    [id],
  );

  return res.rows[0] || null;
};

export const getTimetableForLocation = async (id, day) => {
  const condition = day
    ? `WHERE t.location_id = $1 AND t.day = $2`
    : `WHERE t.location_id = $1`;

  const params = day ? [id, day] : [id];

  const res = await pool.query(
    `SELECT
        t.*,
        c.code AS course_code,
        c.name AS course_name,
        d.name AS department_name,
        f.name AS faculty_name
       FROM timetable t
        JOIN courses c ON c.id = t.course_id
        JOIN departments d ON d.id = c.department_id
        JOIN faculties f ON f.id = d.faculty_id
       ${condition}
       ORDER BY t.start_time ASC`,
    params,
  );

  if (day) return res.rows;

  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return DAYS.reduce((acc, d) => {
    acc[d] = res.rows.filter((row) => row.day === d);
    return acc;
  }, {});
};