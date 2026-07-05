import * as Location from "../models/location.models.js";

export const getLocations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const { locations, totalLocations, totalPages } =
      await Location.getAllLocations(page, limit);

    if (!locations.length) {
      return res.status(404).json({ message: "No locations found" });
    }

    return res.status(200).json({
      success: true,
      message: "Locations fetched successfully",
      page,
      limit,
      totalLocations,
      totalPages,
      locations,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch locations" });
  }
};

// controllers/locationController.js

export const searchLocationsByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name query param is required" });
    }

    const foundLocations = await Location.searchLocationsByName(name);

    if (foundLocations.length === 0) {
      return res
        .status(404)
        .json({ message: "No locations found matching the name" });
    }

    res.status(200).json({ success: true, locations: foundLocations });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addLocation = async (req, res) => {
  try {
    const { name, type, latitude, longitude } = req.body;

    if (!name || !type || latitude == null || longitude == null) {
      return res.status(400).json({
        error: "All fields (name, type, latitude, longitude) are required.",
      });
    }

    if (
      typeof latitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      typeof longitude !== "number" ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res
        .status(400)
        .json({ error: "Invalid latitude or longitude values." });
    }

    const existingLocation = await Location.getLocationByCoordinates({
      latitude,
      longitude,
    });

    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location with this coordinates exists",
        data: existingLocation,
      });
    }

    const newLocation = await Location.createLocation({
      name,
      type,
      latitude,
      longitude,
    });
    return res.status(201).json({
      message: "Location added successfully",
      location: newLocation,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to add location" });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Location.deleteLocation(id);

    if (!deleted) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.status(200).json({ message: "Location deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete location" });
  }
};

export const getTimetableForLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { day } = req.query;

    const location = await Location.getLocationById(id);
    if (!location) {
      return res.status(404).json({
        success: false,
        message: "Location not found",
      });
    }

    const timetable = await Location.getTimetableForLocation(id, day);
    const entryCount = day ? timetable.length : Object.values(timetable).flat().length;

    return res.status(200).json({
      success: true,
      message: `${entryCount} timetable entry(s) found`,
      data: timetable,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch timetable",
    });
  }
};
