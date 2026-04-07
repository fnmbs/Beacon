import * as Faculty from "../models/faculty.models.js";

const createFaculty = async (req, res) => {
  try {
    const { name, code, email, buildingId, establishedYear } = req.body;

    if (!name || !code || !email) {
      return res.status(400).json({
        success: false,
        message: "Input all fields",
      });
    }

    //check if faculty already exists
    const ifFacultyExists = await Faculty.ifFacultyExists(name, code, email);

    //if faculty exists, return
    if (ifFacultyExists) {
      return res.status(409).json({
        success: false,
        message: "Faculty already exists",
      });
    }

    //if faculty doesn't exist, create
    const createdFaculty = await Faculty.createFaculty(
      name,
      code,
      email,
      buildingId,
      establishedYear,
    );

    return res.status(201).json({
      success: true,
      message: "Faculty has been successfully created",
      data: createdFaculty,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const removeFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid faculty Id",
      });
    }

    //check if faculty exists by id
    const isFacultyExists = await Faculty.facultyExists(facultyId);

    //if faculty doesnt exist
    if (!isFacultyExists) {
      return res.status(409).json({
        success: false,
        message: "Faculty does not exist",
      });
    }

    //remove faculty
    const deletedFaculty = await Faculty.removeFaculty(facultyId);

    return res.status(200).json({
      success: true,
      message: "Faculty deleted successfully",
      data: deletedFaculty,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { name, code, email, buildingId, establishedYear } = req.body;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid faculty Id",
      });
    }

    if (!name && !code && !email && !establishedYear && !buildingId) {
      return res.status(400).json({
        success: false,
        message: "At least one field has to be filled",
      });
    }

    //check if faculty exists by id
    const isFacultyExists = await Faculty.facultyExists(facultyId);

    //if faculty doesnt exist
    if (!isFacultyExists) {
      return res.status(409).json({
        success: false,
        message: "Faculty does not exist",
      });
    }

    //update faculty
    const updatedFaculty = await Faculty.updateFaculty(
      facultyId,
      name,
      code,
      email,
      buildingId,
      establishedYear,
    );

    return res.status(200).json({
      success: true,
      message: "Faculty updated successfully",
      data: updatedFaculty,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllFaculties = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Faculty.getAllFaculties(page, limit);

    res.status(200).json({
      success: true,
      message: "All faculties retrieved",
      data: result.faculties,
      totalFaculties: result.total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const searchFaculties = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const result = await Faculty.searchFaculties(query);

    res.status(200).json({
      success: true,
      message: "Faculties search results",
      data: result.faculties,
      totalFaculties: result.total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDepartmentsInFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;

    console.log("facultyId:", facultyId);

    //check if faculty exists
    const ifFacultyExists = await Faculty.facultyExists(facultyId);

    if (!ifFacultyExists) {
      return res.status(400).json({
        success: false,
        message: "Faculty doesn't exist",
      });
    }

    //fetch departments
    const departments = await Faculty.getDepartmentsInFaculty(facultyId);

    return res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: departments,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const getAllLecturers = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * 10;

    if (!facultyId) {
      return res.status(404).json({
        success: false,
        message: "Enter a valid faculty Id",
      });
    }

    //check if faculty exists by id
    const isFacultyExists = await Faculty.facultyExists(facultyId);

    //if faculty doesnt exist
    if (!isFacultyExists) {
      return res.status(409).json({
        success: false,
        message: "Faculty does not exist",
      });
    }

    //if exists, fetch lecturer
    const { lecturers, total } = await Faculty.getAllLecturers(
      facultyId,
      limit,
      offset,
    );

    if (lecturers.length === 0) {
      return res.status(404).json({
        success: true,
        message: "No lecturers found",
      });
    }

    return res.status(200).json({
      success: true,
      message: lecturers.length + " Lecturers found",
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

const getFacultyById = async (req, res) => {
  try {
    const { facultyId } = req.params;

    if (!facultyId) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid faculty Id",
      });
    }

    const faculty = await Faculty.getFacultyById(facultyId);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Faculty retrieved successfully",
      data: faculty,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export {
  createFaculty,
  removeFaculty,
  getAllFaculties,
  searchFaculties,
  getFacultyById,
  updateFaculty,
  getDepartmentsInFaculty,
  getAllLecturers,
};
