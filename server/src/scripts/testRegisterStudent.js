import 'dotenv/config';

const API_BASE = process.env.TEST_API_BASE || 'http://localhost:5000/api';

const email = `test_student_${Date.now()}@example.com`;
const password = 'Testpass123!';

async function run() {
  try {
    console.log('Fetching departments...');
    const depsRes = await fetch(`${API_BASE}/departments`);
    const depsJson = await depsRes.json();
    const departments = depsJson.data || depsJson.departments || [];
    if (!departments.length) {
      console.error('No departments available to register against.');
      process.exit(1);
    }
    const dept = departments[0];
    console.log('Using department:', dept.name || dept.id);

    const payload = {
      email,
      password,
      fullName: 'Test Student',
      role: 'student',
      level: 400,
      departmentId: dept.id,
    };

    console.log('Registering student...', payload.email);
    const registerRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const registerJson = await registerRes.json();
    console.log('Register response:', registerJson.success ? 'SUCCESS' : 'FAIL', registerJson.message || '');

    if (!registerJson.success) {
      console.error('Register failed:', registerJson);
      process.exit(1);
    }

    const token = registerJson.data?.token?.accessToken;
    if (!token) {
      console.error('No token returned; cannot fetch /auth/me');
      process.exit(1);
    }

    console.log('Fetching /auth/me...');
    const meRes = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meJson = await meRes.json();
    console.log('Me:', JSON.stringify(meJson, null, 2));

    const profile = meJson.data?.profile || meJson.profile || meJson.data;
    if (!profile) {
      console.error('No profile in /auth/me response');
      process.exit(1);
    }

    console.log('Assigned compulsory:', profile.assigned_compulsory_course_ids);
    console.log('Chosen electives:', profile.chosen_elective_course_ids);
    console.log('Test complete.');
  } catch (e) {
    console.error('Test failed', e);
    process.exit(1);
  }
}

run();
