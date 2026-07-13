import pool from "../config/db.js";

const DEFAULT_BOUNDARY = {
  name: "OOU Campus",
  boundary: [],
  buffer_meters: 150,
  gate_location_id: null,
};

export const ensureCampusBoundaryTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS campus_boundary (
      id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
      name VARCHAR(255) NOT NULL DEFAULT 'OOU Campus',
      boundary JSONB NOT NULL DEFAULT '[]'::jsonb,
      buffer_meters INT NOT NULL DEFAULT 150,
      gate_location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    INSERT INTO campus_boundary (id, name, boundary, buffer_meters)
    VALUES (1, $1, $2, $3)
    ON CONFLICT (id) DO NOTHING;
  `, [DEFAULT_BOUNDARY.name, JSON.stringify(DEFAULT_BOUNDARY.boundary), DEFAULT_BOUNDARY.buffer_meters]);
};

export const getCampusBoundary = async () => {
  await ensureCampusBoundaryTable();
  const res = await pool.query(
    `SELECT cb.*, l.name AS gate_location_name, l.latitude AS gate_latitude, l.longitude AS gate_longitude
     FROM campus_boundary cb
     LEFT JOIN locations l ON l.id = cb.gate_location_id
     WHERE cb.id = 1`,
  );
  return res.rows[0] || DEFAULT_BOUNDARY;
};

export const updateCampusBoundary = async ({
  name,
  boundary,
  buffer_meters,
  gate_location_id,
}) => {
  await ensureCampusBoundaryTable();
  const res = await pool.query(
    `UPDATE campus_boundary
     SET name = $1,
         boundary = $2,
         buffer_meters = $3,
         gate_location_id = $4,
         updated_at = NOW()
     WHERE id = 1
     RETURNING *`,
    [name, JSON.stringify(boundary), buffer_meters, gate_location_id || null],
  );
  return res.rows[0];
};
