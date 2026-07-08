import pool from "../config/db.js";

const initAuthDb = async () => {
  try {
    console.log("Initializing auth tables...");
    await pool.query("DROP TABLE IF EXISTS email_verification_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS password_reset_tokens CASCADE");
    await pool.query("DROP TABLE IF EXISTS refresh_tokens CASCADE");
    console.log("✓ Old auth token tables removed");

    // Detect users.id column type (UUID on Render, integer locally)
    const typeRes = await pool.query(`
      SELECT data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'users' AND column_name = 'id'
    `);
    const idType = typeRes.rows[0]?.udt_name || 'uuid';
    // Convert to SQL column definition
    const userIdCol = idType === 'int4' || idType === 'integer' ? 'INTEGER' : 'UUID';
    console.log("✓ Detected users.id type: " + userIdCol);

    // Add auth columns to users table
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT false;
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_email VARCHAR(255);
    `);
    console.log("✓ Users table augmented with auth columns");

    // Create refresh_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id ${userIdCol} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Refresh tokens table created successfully");

    // Create password_reset_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id ${userIdCol} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Password reset tokens table created successfully");

    // Create email_verification_tokens table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_verification_tokens (
        id SERIAL PRIMARY KEY,
        user_id ${userIdCol} NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(500) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        type VARCHAR(50) DEFAULT 'verify',
        pending_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Email verification tokens table created successfully");

    // Create indexes
    await pool.query("CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id)");
    await pool.query("CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id)");
    console.log("✓ Indexes created successfully");

  } catch (error) {
    console.error("Error initializing auth database:", error);
    throw error;
  }
};

export default initAuthDb;
