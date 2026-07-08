import { create } from "zustand";
import { getPaths, addPath as addPathApi, deletePath as deletePathApi } from "../api/axios";

const usePathStore = create((set, get) => ({
  paths: [],
  totalPaths: 0,
  totalPages: 0,
  totalPathsDistance: 0,
  page: 1,
  loading: false,
  error: null,

  fetchPaths: async (page, limit) => {
    set({ loading: true, error: null });

    try {
      const res = await getPaths(page, limit);

      set({
        paths: res.data.paths,
        totalPaths: res.data.totalPaths,
        totalPathsDistance: res.data.totalPathsDistance,
        totalPages: res.data.totalPages,
        page: res.data.page,
        loading: false,
      });
    } catch (error) {
      console.error("Failed to fetch paths:", error);
      set({ error: "Failed to fetch paths", loading: false });
    }
  },

  addPath: async (data) => {
    try {
      const res = await addPathApi(data);
      const { paths } = get();
      const newPath = res.data.path || res.data.data || res.data;
      set({ paths: [newPath, ...paths], totalPaths: paths.length + 1 });
      return res.data;
    } catch (err) {
      console.error("Failed to add path:", err);
      throw err;
    }
  },

  deletePath: async (id) => {
    try {
      await deletePathApi(id);
      const { paths, totalPaths } = get();
      set({
        paths: paths.filter((p) => p.id !== id),
        totalPaths: totalPaths - 1,
      });
    } catch (err) {
      console.error("Failed to delete path:", err);
      throw err;
    }
  },
}));

export default usePathStore;
