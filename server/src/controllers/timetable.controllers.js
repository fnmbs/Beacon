import * as Course from "../models/course.models.js";
import * as Location from "../models/location.models.js";
import * as Timetable from "../models/timetable.models.js";

const VALID_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

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

    console.log({ location_id, day, start_time, end_time });

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

export { scheduleCourse };
