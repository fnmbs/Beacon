import { create } from "zustand";
import { getPaths } from "../api/axios";

const usePathStore = create((set) => ({
  paths: [],
  totalPaths: 0,
  totalPages: 0,
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
}));

export default usePathStore;
