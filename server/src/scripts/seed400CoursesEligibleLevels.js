import pool from '../config/db.js';

console.log('Seeding level 400 into eligible_levels where missing...');
try {
  // ensure column exists
  await pool.query(`ALTER TABLE courses ADD COLUMN IF NOT EXISTS eligible_levels INT[] DEFAULT ARRAY[]::integer[];`);

  const result = await pool.query(`
    UPDATE courses
    SET eligible_levels = CASE
      WHEN eligible_levels IS NULL OR array_length(eligible_levels,1) = 0 THEN ARRAY[400]::integer[]
      WHEN NOT (400 = ANY(eligible_levels)) THEN array_append(eligible_levels, 400)
      ELSE eligible_levels
    END
    WHERE eligible_levels IS NULL OR NOT (400 = ANY(eligible_levels));
  `);

  console.log(`Seed complete: ${result.rowCount} rows updated.`);
} catch (err) {
  console.error('Seeding failed:', err);
  process.exitCode = 1;
} finally {
  try {
    await pool.end();
  } catch (e) {
    // ignore
  }
}
