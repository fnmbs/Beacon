import pool from "../config/db.js";

export const getAll = async () => {
  const res = await pool.query("SELECT * FROM quick_destinations ORDER BY sort_order ASC, label ASC");
  return res.rows;
};

export const getById = async (id) => {
  const res = await pool.query("SELECT * FROM quick_destinations WHERE id = $1", [id]);
  return res.rows[0] || null;
};

export const create = async ({ label, icon, location_id, match_keywords, sort_order }) => {
  const res = await pool.query(
    `INSERT INTO quick_destinations(label, icon, location_id, match_keywords, sort_order)
     VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [label, icon || null, location_id, match_keywords || [], sort_order || 0]
  );
  return res.rows[0];
};

export const update = async (id, { label, icon, location_id, match_keywords, sort_order }) => {
  const res = await pool.query(
    `UPDATE quick_destinations SET label=$1, icon=$2, location_id=$3, match_keywords=$4, sort_order=$5, updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [label, icon || null, location_id, match_keywords || [], sort_order || 0, id]
  );
  return res.rows[0] || null;
};

export const remove = async (id) => {
  await pool.query("DELETE FROM quick_destinations WHERE id = $1", [id]);
};
