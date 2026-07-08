import { create } from "zustand";
import { getLocations, searchLocations, addLocation as addLocationApi, deleteLocation as deleteLocationApi } from "../api/axios";

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

  addLocation: async (data) => {
    try {
      const res = await addLocationApi(data);
      const { locations } = get();
      set({
        locations: [...locations, res.data.location || res.data.data || res.data],
        totalLocations: locations.length + 1,
      });
      return res.data;
    } catch (err) {
      console.error("Failed to add location:", err);
      throw err;
    }
  },

  deleteLocation: async (id) => {
    try {
      await deleteLocationApi(id);
      const { locations, totalLocations } = get();
      set({
        locations: locations.filter((l) => l.id !== id),
        totalLocations: totalLocations - 1,
      });
    } catch (err) {
      console.error("Failed to delete location:", err);
      throw err;
    }
  },
}));

export default useLocationStore;