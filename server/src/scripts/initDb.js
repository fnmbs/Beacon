import pool from "../config/db.js";

const createTables = async () => {
  try {
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
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student'
      );
    `);
    console.log("✅ Table 'users' created with UUID");

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
    day VARCHAR(10) CHECK (day IN ('Monday','Tuesday','Wednesday','Thursday','Friday')) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
    );`);

    console.log("timetable created successfully");

    await pool.query(`
      ALTER TABLE faculties ADD COLUMN IF NOT EXISTS dean_id UUID REFERENCES lecturers(id);
    `);
    await pool.query(`
      ALTER TABLE departments ADD COLUMN IF NOT EXISTS head_id UUID REFERENCES lecturers(id);
    `);
    console.log("✅ dean_id and head_id added");

    console.log("All tables created successfully with UUIDs!");
    process.exit();
  } catch (err) {
    console.error("Error creating tables:", err);
    process.exit(1);
  }
};

createTables();
