import * as Department from "../models/department.models.js";
import * as Faculty from "../models/faculty.models.js";
import * as Course from "../models/course.models.js";

const createDepartment = async (req, res) => {
  try {
    const { name, code, email, buildingId, facultyId, headId } = req.body;

    if (!name || !code || !email || !facultyId) {
      return res.status(400).json({
        success: false,
        message: "Input the required field",
      });
    }

    const ifDepartmentExists = await Department.ifDepartmentExists(
      name,
      code,
      email,
    );

    //if department exists, return
    if (ifDepartmentExists) {
      return res.status(409).json({
        success: false,
        message: "Department already exists",
      });
    }

    const ifFacultyExists = await Faculty.getFacultyById(facultyId);

    if (!ifFacultyExists) {
      return res.status(400).json({
        success: false,
        message: "Faculty doesn't exist",
      });
    }

    //if department doesn't exist, create
    const createdDepartment = await Department.createDepartment(
      name,
      code,
      email,
      buildingId,
      facultyId,
      headId,
    );

    return res.status(201).json({
      success: true,
      message: "Department has been successfully created",
      data: createdDepartment,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    //check if department exists by id
    const isDepartmentExists = await Department.getDepartmentById(id);

    //if department doesnt exist
    if (!isDepartmentExists) {
      return res.status(409).json({
        success: false,
        message: "Department does not exist",
      });
    }

    //remove department
    const deletedDepartment = await Department.deleteDepartment(id);

    return res.status(200).json({
      success: true,
      message: "department deleted successfully",
      data: deletedDepartment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const isDepartmentExists = await Department.getDepartmentById(id);

    //if department doesnt exist
    if (!isDepartmentExists) {
      return res.status(409).json({
        success: false,
        message: "Department does not exist",
      });
    }

    const department = await Department.getDepartmentById(id);

    return res.status(200).json({
      success: true,
      message: "Department found successfully",
      data: department,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};

const getAllDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Department.getAllDepartments(page, limit);

    res.status(200).json({
      success: true,
      message: "All departments retrieved",
      data: result.departments,
      totalDepartments: result.total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: true,
      message: "Internal Server Error",
    });
  }
};

const updateDepartment = async (req, res) => {
  const { id } = req.params;

  const { name, code, email, buildingId, facultyId, headId } = req.body;

  if (!name || !code || !email || !facultyId) {
    return res.status(400).json({
      success: false,
      message: "Input the required field",
    });
  }

  const ifDepartmentExists = await Department.ifDepartmentExists(
    name,
    code,
    email,
  );

  //if department doesn't exists, return
  if (!ifDepartmentExists) {
    return res.status(409).json({
      success: false,
      message: "Department doesn't exist",
    });
  }

  const ifFacultyExists = await Faculty.getFacultyById(facultyId);

  if (!ifFacultyExists) {
    return res.status(400).json({
      success: false,
      message: "Faculty doesn't exist",
    });
  }

  //if department and faculty exist, update

  const updatedDepartment = await Department.updateDepartment(
    id,
    name,
    code,
    email,
    buildingId,
    facultyId,
    headId,
  );

  return res.status(200).json({
    success: true,
    message: "Department updated successfully",
    data: updatedDepartment,
  });
};

const getLecturers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const offset = (page - 1) * limit;

    const { lecturers, total } = await Department.getLecturers(
      id,
      limit,
      offset,
    );

    if (lecturers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No lecturers found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lecturers in this department fetched successfully",
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

const getCourses = async (req, res) => {
  try {
    const { id: departmentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Check if department exists
    const department = await Department.getDepartmentById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const { courses, total } = await Course.getCoursesByDepartment(
      departmentId,
      limit,
      offset,
    );

    if (courses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses found for this department",
      });
    }

    return res.status(200).json({
      success: true,
      message: `${total} courses found`,
      courses,
      totalCourses: total,
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

const searchDepartments = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const departments = await Department.searchDepartments(query);

    res.status(200).json({
      success: true,
      message: "Departments search results",
      data: departments,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getDepartmentsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await Department.getDepartmentsByFaculty(
      facultyId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      message: "Departments for faculty retrieved",
      data: result.departments,
      totalDepartments: result.total,
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
  createDepartment,
  deleteDepartment,
  getDepartmentById,
  getAllDepartments,
  updateDepartment,
  getLecturers,
  getCourses,
  searchDepartments,
  getDepartmentsByFaculty,
};
