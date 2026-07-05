import dotenv from 'dotenv';

dotenv.config();

const BASE = `http://localhost:${process.env.PORT || 5000}/api/v1`;

async function run() {
  try {
    console.log('Fetching faculties...');
    const fRes = await fetch(`${BASE}/faculties`);
    const fJson = await fRes.json();
    const faculties = fJson.data || fJson.faculties || [];
    if (!faculties.length) {
      console.error('No faculties found. Aborting test.');
      process.exit(1);
    }
    const facultyId = faculties[0].id;
    console.log('Using facultyId:', facultyId);

    console.log('Fetching departments for faculty...');
    const dRes = await fetch(`${BASE}/departments/faculty/${facultyId}`);
    const dJson = await dRes.json();
    const departments = dJson.data || dJson.departments || [];
    if (!departments.length) {
      console.error('No departments found for faculty. Aborting test.');
      process.exit(1);
    }
    const departmentId = departments[0].id;
    console.log('Using departmentId:', departmentId);

    const code = `TEST-EL-${Date.now()}`;
    const payload = {
      code,
      name: 'Test Eligible Levels Course',
      description: 'Created by test script',
      facultyId,
      departmentId,
      eligible_levels: [100,400],
      credits: 3,
      semester: 'harmattan',
      type: 'compulsory',
    };

    console.log('Creating course with eligible_levels:', payload.eligible_levels);
    const createRes = await fetch(`${BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const createJson = await createRes.json();
    console.log('Create response status:', createRes.status);
    console.log(createJson);
    if (!createRes.ok) process.exit(1);

    const courseId = createJson.data.id || createJson.data?.id;
    console.log('Fetching created course by id:', courseId);
    const getRes = await fetch(`${BASE}/courses/${courseId}`);
    const getJson = await getRes.json();
    console.log('Get response status:', getRes.status);
    console.log(getJson);

    const stored = getJson.data;
    console.log('Stored eligible_levels:', stored.eligible_levels);

    if (Array.isArray(stored.eligible_levels) && stored.eligible_levels.includes(400)) {
      console.log('Test passed: 400 present in eligible_levels');
      process.exit(0);
    } else {
      console.error('Test failed: 400 not present in eligible_levels');
      process.exit(2);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  }
}

run();
