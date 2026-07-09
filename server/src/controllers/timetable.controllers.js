import * as Course from "../models/course.models.js";
import * as Location from "../models/location.models.js";
import * as Timetable from "../models/timetable.models.js";
import * as Student from "../models/student.models.js";
import pool from "../config/db.js";

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const scheduleCourse = async (req, res) => {
  try {
    const { course_id, location_id, day, start_time, end_time } = req.body;

    if (!course_id || !location_id || !day || !start_time || !end_time) {
      return res.status(400).json({
        success: false,
        message:
          "course_id, location_id, day, start_time and end_time are required",
      });
    }

    if (!VALID_DAYS.includes(day)) {
      return res.status(400).json({
        success: false,
        message: `Invalid day. Must be one of: ${VALID_DAYS.join(", ")}`,
      });
    }

    const [startH, startM] = start_time.split(":").map(Number);
    const [endH, endM] = end_time.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: "start_time must be before end_time",
      });
    }

    //check if course exists
    const course = await Course.getCourseById(course_id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    //check if location exists
    const location = await Location.getLocationById(location_id);

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    if (!(location.type == "academic")) {
      return res.status(400).json({
        success: false,
        message: `A class cant be held here in location with a type of ${location.type}`,
      });
    }

    const conflict = await Timetable.checkConflict(
      location_id,
      day,
      start_time,
      end_time,
    );

    if (conflict > 0) {
      return res.status(409).json({
        success: false,
        message: "Location is already booked during this time",
      });
    }

    const schedule = await Timetable.scheduleCourse(
      course_id,
      location_id,
      day,
      start_time,
      end_time,
    );

    return res.status(201).json({
      success: true,
      message: "Schedule created successfully",
      data: schedule,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getUserTimetable = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const profile = await Student.getStudentProfileByUserId(userId);

    if (!profile) {
      return res.status(200).json({
        success: true,
        message: "No student profile found",
        data: [],
      });
    }

    const courseIds = [
      ...(profile.assigned_compulsory_course_ids || []),
      ...(profile.chosen_elective_course_ids || []),
    ];

    if (courseIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No timetable entries found",
        data: [],
      });
    }

    const result = await pool.query(
      `SELECT
         t.id,
         t.course_id,
         t.location_id,
         t.day,
         t.start_time,
         t.end_time,
         c.code,
         c.name AS course_name,
         c.credits,
         l.name AS location_name
       FROM timetable t
       JOIN courses c ON c.id = t.course_id
       LEFT JOIN locations l ON l.id = t.location_id
       WHERE t.course_id = ANY($1)
       ORDER BY CASE t.day
         WHEN 'Monday' THEN 1
         WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5
         ELSE 6
       END, t.start_time ASC`,
      [courseIds],
    );

    return res.status(200).json({
      success: true,
      message: `${result.rows.length} timetable entry(s) found`,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getTimetableByCourses = async (req, res) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(200).json({ success: true, data: [] });
    }
    const courseIds = Array.isArray(ids) ? ids : ids.split(",");
    const rows = await Timetable.getTimetableByCourseIds(courseIds);
    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const downloadTimetable = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Student.getStudentProfileByUserId(userId);

    if (!profile) {
      return res.status(404).json({ success: false, message: "No student profile found" });
    }

    const courseIds = [
      ...(profile.assigned_compulsory_course_ids || []),
      ...(profile.chosen_elective_course_ids || []),
    ];

    if (courseIds.length === 0) {
      return res.status(404).json({ success: false, message: "No courses enrolled" });
    }

    const result = await pool.query(
      `SELECT
         t.day, t.start_time, t.end_time,
         c.code, c.name AS course_name, c.credits,
         l.name AS location_name
       FROM timetable t
       JOIN courses c ON c.id = t.course_id
       LEFT JOIN locations l ON l.id = t.location_id
       WHERE t.course_id = ANY($1)
       ORDER BY CASE t.day
         WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5 ELSE 6
       END, t.start_time ASC`,
      [courseIds],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No timetable entries" });
    }

    let csv = "Day,Start,End,Code,Course,Credits,Location\n";
    for (const row of result.rows) {
      const loc = (row.location_name || "").replace(/,/g, " ");
      csv += `${row.day},${row.start_time},${row.end_time},${row.code},"${row.course_name}",${row.credits},"${loc}"\n`;
    }

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=timetable.csv");
    return res.send(csv);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllTimetable = async (req, res) => {
  try {
    const entries = await Timetable.getAllTimetableEntries();
    return res.status(200).json({ success: true, entries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.deleteTimetableEntry(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Entry not found" });
    return res.status(200).json({ success: true, message: "Entry deleted", entry: deleted });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export { scheduleCourse, getUserTimetable, getTimetableByCourses, downloadTimetable, getAllTimetable, deleteTimetable };
