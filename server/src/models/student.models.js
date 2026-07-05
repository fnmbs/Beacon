import pool from "../config/db.js";

const createStudentProfile = async (userId, level, departmentId, chosenElectives = [], assignedCompulsory = []) => {
  const res = await pool.query(
    `INSERT INTO student_profiles(user_id, level, department_id, chosen_elective_course_ids, assigned_compulsory_course_ids) VALUES($1,$2,$3,$4,$5) RETURNING *`,
    [userId, level, departmentId, chosenElectives, assignedCompulsory],
  );
  return res.rows[0] || null;
};

const getStudentProfileByUserId = async (userId) => {
  const res = await pool.query(
    `SELECT sp.*, d.name AS department_name, f.name AS faculty_name
     FROM student_profiles sp
     LEFT JOIN departments d ON d.id = sp.department_id
     LEFT JOIN faculties f ON f.id = d.faculty_id
     WHERE sp.user_id = $1`,
    [userId],
  );
  return res.rows[0] || null;
};

const updateChosenElectives = async (userId, chosenElectives = []) => {
  const res = await pool.query(
    `UPDATE student_profiles SET chosen_elective_course_ids = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`,
    [chosenElectives, userId],
  );
  return res.rows[0] || null;
};

const assignCompulsoryCourses = async (userId, compulsoryCourseIds = []) => {
  const res = await pool.query(
    `UPDATE student_profiles SET assigned_compulsory_course_ids = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *`,
    [compulsoryCourseIds, userId],
  );
  return res.rows[0] || null;
};

const updateStudentProfile = async (userId, updates) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.level !== undefined) {
    fields.push(`level = $${idx++}`);
    values.push(updates.level);
  }
  if (updates.matricNo !== undefined) {
    fields.push(`matric_no = $${idx++}`);
    values.push(updates.matricNo);
  }
  if (updates.phone !== undefined) {
    fields.push(`phone = $${idx++}`);
    values.push(updates.phone);
  }
  if (updates.departmentId !== undefined) {
    fields.push(`department_id = $${idx++}`);
    values.push(updates.departmentId);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const res = await pool.query(
    `UPDATE student_profiles SET ${fields.join(", ")} WHERE user_id = $${idx} RETURNING *`,
    values,
  );
  return res.rows[0] || null;
};

export { createStudentProfile, getStudentProfileByUserId, updateChosenElectives, assignCompulsoryCourses, updateStudentProfile };
