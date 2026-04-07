import { create } from "zustand";
import {
  getAllFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  searchFaculties,
} from "../api/axios";

const useFacultyStore = create((set) => ({
  faculties: [],
  totalFaculties: 0,
  loading: false,
  error: false,

  fetchFaculties: async (page = 1, limit = 10) => {
    try {
      set({ loading: true, error: false });
      const res = await getAllFaculties(page, limit);
      set({
        faculties: res.data.data,
        totalFaculties: res.data.totalFaculties || res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch faculties:", err);
      set({ error: true, loading: false, faculties: [] });
    }
  },

  fetchSearchFaculties: async (query) => {
    try {
      set({ loading: true, error: false });
      const res = await searchFaculties(query);
      set({
        faculties: res.data.data,
        totalFaculties: res.data.totalFaculties || res.data.data.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to search faculties:", err);
      set({ error: true, loading: false, faculties: [] });
    }
  },

  addFaculty: async (data) => {
    try {
      const res = await createFaculty(data);
      return res.data.data;
    } catch (err) {
      console.error("Failed to add faculty:", err);
      throw err;
    }
  },

  updateFacultyData: async (id, data) => {
    try {
      const res = await updateFaculty(id, data);
      return res.data.data;
    } catch (err) {
      console.error("Failed to update faculty:", err);
      throw err;
    }
  },

  deleteFacultyData: async (id) => {
    try {
      await deleteFaculty(id);
    } catch (err) {
      console.error("Failed to delete faculty:", err);
      throw err;
    }
  },

  clearFaculties: () => set({ faculties: [], totalFaculties: 0 }),
}));

export default useFacultyStore;
