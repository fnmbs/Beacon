import pool from "../config/db.js";

const createAdmin = async function (
  email,
  password,
  fullName = null,
  privileges = [],
) {
  const result = await pool.query(
    "INSERT INTO admins (email, password, full_name, privileges) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, privileges, created_at",
    [email, password, fullName, JSON.stringify(privileges)],
  );
  return result.rows[0];
};

const findAdminByEmail = async function (email) {
  const result = await pool.query("SELECT * FROM admins WHERE email = $1", [
    email,
  ]);
  return result.rows[0] || null;
};

const findAdminById = async function (id) {
  const result = await pool.query(
    "SELECT id, email, full_name, privileges, role, created_at FROM admins WHERE id = $1",
    [id],
  );
  return result.rows[0] || null;
};

const listAdmins = async function () {
  const result = await pool.query(
    `SELECT id, email, full_name, privileges, role, created_at FROM admins ORDER BY created_at DESC`,
  );
  return result.rows;
};

const deleteAdminById = async function (id) {
  const result = await pool.query(
    "DELETE FROM admins WHERE id = $1 RETURNING id, email",
    [id],
  );
  return result.rows[0] || null;
};

const verifyAdminPassword = function (plainPassword, storedPassword) {
  return plainPassword === storedPassword;
};

export {
  createAdmin,
  findAdminByEmail,
  findAdminById,
  listAdmins,
  deleteAdminById,
  verifyAdminPassword,
};
