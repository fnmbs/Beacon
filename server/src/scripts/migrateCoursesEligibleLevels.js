import pool from '../config/db.js';

console.log('Starting migration: populate eligible_levels from level where empty...');
try {
  // ensure column exists (safe to run repeatedly)
  await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS eligible_levels INT[] DEFAULT ARRAY[]::integer[];`);

  const result = await pool.query(`
    UPDATE courses
    SET eligible_levels = ARRAY[level]::integer[]
    WHERE (eligible_levels IS NULL OR array_length(eligible_levels, 1) = 0)
      AND level IS NOT NULL;
  `);

  console.log(`Migration complete: ${result.rowCount} rows updated.`);
} catch (err) {
  console.error('Migration failed:', err);
  process.exitCode = 1;
} finally {
  try {
    await pool.end();
  } catch (e) {
    // ignore
  }
}
