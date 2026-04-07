import { create } from "zustand";
import {
  getDepartmentsByFaculty,
  getDepartmentsByFacultyFilter,
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  searchDepartments,
} from "../api/axios";

const useDepartmentStore = create((set) => ({
  departments: [],
  totalDepartments: 0,
  loading: false,
  error: false,

  fetchDepartmentsByFaculty: async (facultyId) => {
    try {
      set({ loading: true, error: false, departments: [] });
      const res = await getDepartmentsByFaculty(facultyId);
      set({
        departments: res.data.data,
        totalDepartments: res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      set({ error: true, loading: false });
    }
  },

  fetchDepartmentsByFacultyFilter: async (facultyId, page = 1, limit = 10) => {
    try {
      set({ loading: true, error: false });
      const res = await getDepartmentsByFacultyFilter(facultyId, page, limit);
      set({
        departments: res.data.data,
        totalDepartments: res.data.totalDepartments || res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch departments by faculty:", err);
      set({ error: true, loading: false });
    }
  },

  fetchDepartments: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: false });
      const res = await getAllDepartments(page, limit);
      console.log(res.data.data);
      set({
        departments: res.data.data,
        totalDepartments: res.data.totalDepartments || res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch departments:", err);
      set({ error: true, loading: false });
    }
  },

  fetchSearchDepartments: async (query) => {
    try {
      set({ loading: true, error: false });
      const res = await searchDepartments(query);
      set({
        departments: res.data.data,
        totalDepartments: res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to search departments:", err);
      set({ error: true, loading: false });
    }
  },

  addDepartment: async (data) => {
    try {
      const res = await createDepartment(data);
      return res.data.data;
    } catch (err) {
      console.error("Failed to add department:", err);
      throw err;
    }
  },

  updateDepartment: async (id, data) => {
    try {
      const res = await updateDepartment(id, data);
      return res.data.data;
    } catch (err) {
      console.error("Failed to update department:", err);
      throw err;
    }
  },

  deleteDepartment: async (id) => {
    try {
      await deleteDepartment(id);
    } catch (err) {
      console.error("Failed to delete department:", err);
      throw err;
    }
  },

  clearDepartments: () => set({ departments: [], totalDepartments: 0 }),
}));

export default useDepartmentStore;
