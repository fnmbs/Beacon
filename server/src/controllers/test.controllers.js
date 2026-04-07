import pool from "../config/db.js";

export const testDatabase = async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    return res.status(200).json({
      success: true,
      message: "Database connection working",
      timestamp: result.rows[0],
    });
  } catch (error) {
    console.error("Database test error:", error);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
};

export const checkUsersTable = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    return res.status(200).json({
      success: true,
      message: "Users table schema",
      columns: result.rows,
    });
  } catch (error) {
    console.error("Users table check error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check users table",
      error: error.message,
    });
  }
};
