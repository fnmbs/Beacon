import { create } from "zustand";
import {
  getAllCourses,
  getCoursesByDepartment,
  searchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  assignLecturersToCourse,
  getLecturersTeachingCourse,
} from "../api/axios";

const useCourseStore = create((set, get) => ({
  courses: [],
  lecturers: [],
  totalCourses: 0,
  loading: false,
  error: null,

  fetchCourses: async (page, limit) => {
    set({ loading: true, error: null });
    try {
      const res = await getAllCourses(page, limit);
      set({
        courses: res.data.courses,
        totalCourses: res.data.totalCourses,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      set({ error: "Failed to fetch courses", loading: false });
    }
  },

  fetchCoursesByDepartment: async (departmentId, page, limit) => {
    set({ loading: true, error: null });
    try {
      const res = await getCoursesByDepartment(departmentId, page, limit);
      set({
        courses: res.data.courses,
        totalCourses: res.data.totalCourses,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch courses by department:", error);
      set({ error: "Failed to fetch courses", loading: false });
    }
  },

  fetchSearchCourses: async (query) => {
    set({ loading: true, error: null });
    try {
      const res = await searchCourses(query);
      set({
        courses: res.data.courses,
        totalCourses: res.data.totalCourses,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to search courses:", error);
      set({ error: "Failed to search courses", loading: false });
    }
  },

  addCourse: async (data) => {
    try {
      const courseData = {
        code: data.code,
        name: data.name,
        description: data.description,
        facultyId: data.facultyId,
        departmentId: data.departmentId,
        level: Number(data.level),
        credits: Number(data.credits),
        semester: data.semester,
        type: data.type,
      };
      const res = await createCourse(courseData);
      set((state) => ({
        courses: [res.data.data, ...state.courses],
        totalCourses: state.totalCourses + 1,
      }));
      return res.data.data;
    } catch (error) {
      console.error("Failed to add course:", error);
      set({ error: "Failed to add course" });
      throw error;
    }
  },

  updateCourse: async (id, data) => {
    try {
      const res = await updateCourse(id, data);
      console.log(res.data);
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? res.data.data : c)),
      }));
      return res.data.data;
    } catch (error) {
      console.error("Failed to update course:", error);
      set({ error: "Failed to update course" });
      throw error;
    }
  },

  deleteCourse: async (id) => {
    try {
      await deleteCourse(id);
      set((state) => ({
        courses: state.courses.filter((c) => c.id !== id),
        totalCourses: state.totalCourses - 1,
      }));
    } catch (error) {
      console.error("Failed to delete course:", error);
      set({ error: "Failed to delete course" });
      throw error;
    }
  },

  assignLecturers: async (courseId, lecturerIds) => {
    try {
      const res = await assignLecturersToCourse(courseId, lecturerIds);
      return res.data;
    } catch (error) {
      console.error("Failed to assign lecturers:", error);
      set({ error: "Failed to assign lecturers" });
      throw error;
    }
  },

  fetchAssignedLecturers: async (courseId) => {
    try {
      set({ loading: true, error: null });
      const res = await getLecturersTeachingCourse(courseId);

      set({
        lecturers: res.data.lecturers,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch assigned lecturers:", error);
      set({ error: "Failed to fetch assigned lecturers" });
      throw error;
    }
  },

  clearAssignedLecturers: () => set({ lecturers: [] }),
}));

export default useCourseStore;
