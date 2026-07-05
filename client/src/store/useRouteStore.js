import { create } from "zustand";
import { navigateRoute } from "../api/axios";

const useRouteStore = create((set) => ({
  result: null,
  loading: false,
  error: null,

  findRoute: async (from, to) => {
    set({ loading: true, error: false, result: null });
    try {
      const res = await navigateRoute(from, to);

      set({ result: res.data, loading: false });
    } catch {
      set({ error: "No route found or an error occured", loading: false });
    }
  },

  clearRoute: () => set({ result: null, error: null }),
}));

export default useRouteStore;
