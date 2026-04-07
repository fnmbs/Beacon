import pool from "../config/db.js";

export const getAllPaths = async (page, limit) => {
  try {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        p.id, 
        p.from_location_id, 
        p.to_location_id, 
        p.distance_meters,
        f.name AS from_name,
        t.name AS to_name
      FROM paths p
      JOIN locations f ON f.id = p.from_location_id
      JOIN locations t ON t.id = p.to_location_id
      ORDER BY f.name, t.name
      LIMIT $1 OFFSET $2
    `;

    const res = await pool.query(query, [limit, offset]);

    const countRes = await pool.query(`SELECT COUNT(*) FROM paths`);
    const totalPaths = parseInt(countRes.rows[0].count, 10);

    const countPathDistanceRes = await pool.query(
      `SELECT SUM(distance_meters) FROM paths`,
    );
    const totalPathsDistance = parseInt(countPathDistanceRes.rows[0].sum, 10);

    return {
      paths: res.rows,
      totalPaths,
      totalPathsDistance,
      totalPages: Math.ceil(totalPaths / limit),
    };
  } catch (err) {
    console.error("Error fetching all paths:", err);
    throw err;
  }
};

export const getPathById = async (id) => {
  try {
    const query = "SELECT * FROM paths WHERE id = $1";
    const res = await pool.query(query, [id]);
    return res.rows[0] || null;
  } catch (err) {
    console.error(`Error fetching path with id ${id}:`, err);
    throw err;
  }
};

export const createPath = async (pathData) => {
  try {
    const { from_location_id, to_location_id, distance_meters } = pathData;

    const res1 = await pool.query(
      "INSERT INTO paths (from_location_id, to_location_id, distance_meters) VALUES ($1, $2, $3) RETURNING *",
      [from_location_id, to_location_id, distance_meters],
    );

    const res2 = await pool.query(
      "INSERT INTO paths (from_location_id, to_location_id, distance_meters) VALUES ($1, $2, $3) RETURNING *",
      [to_location_id, from_location_id, distance_meters],
    );

    return {
      forward: res1.rows[0],
      backward: res2.rows[0],
    };
  } catch (err) {
    console.error("Error creating path:", err);
    throw err;
  }
};

export const getPathBetween = async (fromId, toId) => {
  try {
    const res = await pool.query(
      `SELECT * FROM paths
     WHERE (from_location_id = $1 AND to_location_id = $2)
        OR (from_location_id = $2 AND to_location_id = $1)`,
      [fromId, toId],
    );

    return res.rows[0]; // returns the existing path or undefined
  } catch (err) {
    console.error("Error getting Paths between locations", err);
    throw err;
  }
};

export const deletePath = async (id) => {
  try {
    const res = await pool.query(
      "DELETE from paths WHERE id = $1 RETURNING *",
      [id],
    );
    return res.rows[0];
  } catch (err) {
    console.error("Error deleting Paths", err);
    throw err;
  }
};
