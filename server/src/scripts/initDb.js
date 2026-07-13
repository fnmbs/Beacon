import { fileURLToPath } from "url";
import pool from "../config/db.js";

const createTables = async () => {
  try {
    // Enable required PostgreSQL extensions
    await pool.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    console.log("✅ Extensions enabled");

    // 1️⃣ Locations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        latitude DECIMAL(9,6),
        longitude DECIMAL(9,6)
      );
    `);
    console.log("✅ Table 'locations' created with UUID");

    // 2️⃣ Paths table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS paths (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        from_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        to_location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
        distance_meters DECIMAL(10,2) NOT NULL
      );
    `);
    console.log("✅ Table 'paths' created with UUID");

    // 3️⃣ Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        is_email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'users' created with UUID");

    // 4️⃣ Admins table (standalone admin records — do NOT reference users)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        privileges JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ Table 'admins' created (standalone) with UUID");

    // Faculty table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faculties (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        email VARCHAR(255) UNIQUE NOT NULL,
        building_id UUID REFERENCES locations(id),
        is_active BOOLEAN DEFAULT true,
        established_year INT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✅ Table 'faculties' created with UUID");

    // Departments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(10) NOT NULL UNIQUE,
        faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        building_id UUID REFERENCES locations(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    console.log("✅ departments");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS lecturers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        department_id UUID REFERENCES departments(id) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ lecturers");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code VARCHAR(20) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE NOT NULL,
        department_id UUID REFERENCES departments(id) ON DELETE CASCADE NOT NULL,
        level INT CHECK (level IN (100,200,300,400,500,600,700)) NOT NULL,
        eligible_levels INT[] DEFAULT ARRAY[]::integer[],
        credits INT CHECK (credits IN (1, 2, 3, 4, 5, 6)) NOT NULL,
        semester VARCHAR(10) CHECK (semester IN ('harmattan', 'rain')) NOT NULL,
        type VARCHAR(10) CHECK (type IN ('elective','compulsory')) NOT NULL,
        is_active BOOLEAN DEFAULT true CHECK (is_active IN (true, false)) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
        );
    `);
    console.log("courses created successfully");

    await pool.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES faculties(id) ON DELETE CASCADE;
    `);
    console.log("✅ faculty_id added to courses table");

    await pool.query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS eligible_levels INT[] DEFAULT ARRAY[]::integer[];
    `);
    console.log("✅ eligible_levels column ensured on courses table");

    // normalize eligible_levels to only contain allowed values
    await pool.query(`
      UPDATE courses
      SET eligible_levels = (
        SELECT COALESCE(ARRAY_AGG(elem), ARRAY[]::int[])
        FROM unnest(eligible_levels) AS elem
        WHERE elem = ANY(ARRAY[100,200,300,400,500,600,700]::int[])
      )
      WHERE eligible_levels IS NOT NULL;
    `);
    console.log("✅ eligible_levels normalized to allowed values");

    // add CHECK constraint to ensure eligible_levels is subset of allowed levels
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_eligible_levels_values'
        ) THEN
          EXECUTE 'ALTER TABLE courses ADD CONSTRAINT chk_eligible_levels_values CHECK (eligible_levels IS NULL OR eligible_levels <@ ARRAY[100,200,300,400,500,600,700]::int[])';
        END IF;
      END
      $$;
    `);
    console.log("✅ eligible_levels constraint ensured on courses table");

    const userIdTypeRes = await pool.query(`
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_name = 'users'
        AND column_name = 'id';
    `);
    const userIdType = userIdTypeRes.rows[0]?.udt_name;

    if (userIdType === "uuid") {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          level INT,
          department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
          chosen_elective_course_ids UUID[] DEFAULT ARRAY[]::uuid[],
          assigned_compulsory_course_ids UUID[] DEFAULT ARRAY[]::uuid[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
          content TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } else {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS student_profiles (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          level INT,
          department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
          chosen_elective_course_ids UUID[] DEFAULT ARRAY[]::uuid[],
          assigned_compulsory_course_ids UUID[] DEFAULT ARRAY[]::uuid[],
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
          content TEXT DEFAULT '',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    }
    await pool.query(`
      ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS matric_no VARCHAR(50);
    `);
    await pool.query(`
      ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
    `);
    console.log("✅ student_profiles table ensured");

    await pool.query(`
    CREATE TABLE IF NOT EXISTS course_lecturers (
      course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
      lecturer_id UUID REFERENCES lecturers(id) ON DELETE CASCADE,
      PRIMARY KEY (course_id, lecturer_id)
      );`);

    console.log("course lecturer table created");

    await pool.query(`
    CREATE TABLE IF NOT EXISTS timetable (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    location_id UUID REFERENCES locations(id) NOT NULL,
    day VARCHAR(10) CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday')) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log("timetable created successfully");

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
      VALUES (1, 'OOU Campus', '[]'::jsonb, 150)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("campus boundary created successfully");

    console.log("✅ notes table created");

    await pool.query(`
      ALTER TABLE faculties ADD COLUMN IF NOT EXISTS dean_id UUID REFERENCES lecturers(id);
    `);
    await pool.query(`
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_id UUID REFERENCES lecturers(id);
    `);
    console.log("✅ dean_id and head_id added");

    console.log("All tables created successfully with UUIDs!");
  } catch (err) {
    console.error("Error creating tables:", err);
    throw err;
  }
};

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  createTables().catch((err) => {
    console.error("Error creating tables:", err);
    process.exit(1);
  });
}

export default createTables;
