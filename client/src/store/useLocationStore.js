import { create } from "zustand";
import { getLocations, searchLocations } from "../api/axios";

const useLocationStore = create((set, get) => ({
  locations: [],
  totalLocations: 0,
  loading: false,
  error: false,

  fetchLocations: async (page, limit) => {
    try {
      set({ loading: true, error: false });
      const res = await getLocations(page, limit);
      set({
        locations: res.data.locations,
        totalLocations: res.data.totalLocations,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      set({ error: true, loading: false });
    }
  },

  searchLocations: async (name) => {
    try {
      set({ loading: true, error: false });
      const res = await searchLocations(name);
      set({
        locations: res.data.locations,
        totalLocations: res.data.locations.length,
        loading: false,
      });
    } catch (err) {
      console.error("Failed to search locations:", err);
      set({ error: true, loading: false });
    }
  },
}));

export default useLocationStore;