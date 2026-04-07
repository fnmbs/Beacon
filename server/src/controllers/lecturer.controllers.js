import * as Lecturer from "../models/lecturer.models.js";

const getAllLecturers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { lecturers, total } = await Lecturer.getAllLecturers(limit, offset);

    if (lecturers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lecturers found",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${total} lecturers found`,
      lecturers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const getLecturerById = async (req, res) => {
  try {
    const { id } = req.params;

    //get lecturer
    const lecturer = await Lecturer.getLecturerById(id);

    if (lecturer.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Lecturer doesn't exist",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lecturer fetched successfully",
      data: lecturer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
const createLecturer = async (req, res) => {
  try {
    const { name, email, departmentId } = req.body;

    if (!name || !email || !departmentId) {
      return res
        .status(400)
        .json({ success: false, message: "Enter valid inputs on all fields" });
    }

    //confirm lecturer doesn't already exist
    const lecturer = await Lecturer.ifLecturerExists(email);

    if (lecturer) {
      return res.status(400).json({
        success: false,
        message: "Lecturer already exists",
      });
    }

    //create lecturer
    const createdLecturer = await Lecturer.createLecturer(
      name,
      email,
      departmentId,
    );

    return res.status(201).json({
      success: true,
      message: "Lecturer has been successfully created",
      data: createdLecturer,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getTimetableForLecturer = async (req, res) => {
  try {
    const { id } = req.params;
    const { day } = req.query;

    const lecturer = await Lecturer.getLecturerById(id);
    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    const timetable = await Lecturer.getTimetableForLecturer(id, day);

    return res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
    });
  }
};

const searchLecturers = async (req, res) => {
  const { name } = req.query;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "name is required" });
  }

  try {
    const lecturers = await Lecturer.searchLecturers(name);
    return res.status(200).json({
      success: true,
      lecturers,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const deleteLecturer = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Id is required",
    });
  }
  try {
    //confirm lecturers existence
    const lecturer = Lecturer.getLecturerById(id);

    if (!lecturer) {
      return res.status(400).json({
        success: false,
        message: "Lecturer doesn't exist",
      });
    }

    //delete lecturer/ make inactive
    await Lecturer.deleteLecturer(id);

    //repond
    return res.status(200).json({
      success: true,
      message: "Lecturer deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateLecturer = async (req, res) => {
  const { id } = req.params;
  const { name, email, departmentId } = req.body;

  if (!id || !name || !email || !departmentId) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  try {
    //confirm lec exits
    const lecturer = await Lecturer.getLecturerById(id);

    if (!lecturer) {
      return res.status(404).json({
        success: false,
        message: "Lecturer not found",
      });
    }

    //update
    const updatedLecturer = await Lecturer.updateLecturer(id, name, email, departmentId);
    console.log(updatedLecturer);

    return res.status(200).json({
      success: true,
      message: "Lecturer updated successfully",
      updatedLecturer,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
export {
  getAllLecturers,
  getLecturerById,
  createLecturer,
  getTimetableForLecturer,
  searchLecturers,
  deleteLecturer,
  updateLecturer,
};
