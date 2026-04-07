import { create } from "zustand";
import {
  deleteLecturer,
  getAllLecturers,
  getLecturersByDepartment,
  getLecturersByFaculty,
  searchLecturers,
  updateLecturer,
} from "../api/axios";

const useLecturerStore = create((set) => ({
  lecturers: [],
  totalLecturers: 0,
  loading: false,
  error: false,

  fetchLecturers: async (page, limit) => {
    try {
      set({ loading: true, error: false });
      const res = await getAllLecturers(page, limit);

      set({
        lecturers: res.data.lecturers,
        totalLecturers: res.data.pagination.total,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch lecturers:", err);
      set({ error: true, loading: false });
    }
  },

  fetchLecturersByDepartment: async (departmentId, page, limit) => {
    try {
      set({ loading: true, error: false });
      const res = await getLecturersByDepartment(departmentId, page, limit);
      console.log(res);
      set({
        lecturers: res.data.lecturers,
        totalLecturers: res.data.pagination.total,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch lecturers by department:", err);
      set({ error: true, loading: false });
    }
  },

  fetchLecturersByFaculty: async (facultyId, page, limit) => {
    try {
      set({ loading: true, error: false });
      const res = await getLecturersByFaculty(facultyId, page, limit);
      console.log(res.data);
      set({
        lecturers: res.data.lecturers,
        totalLecturers: res.data.pagination.total,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch lecturers by faculty:", err);
      set({ error: true, loading: false });
    }
  },

  fetchSearchLecturers: async (name) => {
    try {
      set({ loading: true, error: false });
      const res = await searchLecturers(name);
      set({
        lecturers: res.data.lecturers,
        totalLecturers: res.data.lecturers.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to search lecturers:", err);
      set({ error: true, loading: false });
    }
  },

  updateLecturer: async (id, form) => {
    try {
      set({ loading: true, error: false });
      const res = await updateLecturer(id, form);

      const updatedLecturer = res.data.updatedLecturer;

      set((state) => ({
        lecturers: state.lecturers.map((lec) =>
          lec.id === id ? updatedLecturer : lec,
        ),
        loading: false,
      }));

      return updatedLecturer;
    } catch (err) {
      console.error("Failed to update lecturer:", err);
      set({ error: true, loading: false });
    }
  },

  deleteLecturer: async (id) => {
    try {
      set({ loading: true, error: false });
      await deleteLecturer(id);

      set((state) => ({
        lecturers: state.lecturers.filter((lec) => lec.id !== id),
        loading: false,
        totalLecturers: state.totalLecturers > 0 ? state.totalLecturers - 1 : 0,
      }));
    } catch (err) {
      console.error("Failed to delete lecturer:", err);
      set({ error: true, loading: false });
    }
  },

  clearLecturers: () => set({ lecturers: [] }),
}));

export default useLecturerStore;