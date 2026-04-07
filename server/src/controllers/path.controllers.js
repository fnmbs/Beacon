import * as Path from "../models/path.models.js";
import calculateDistance from "../utils/distance.js";
import * as Location from "../models/location.models.js";

export const getPaths = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    //get all paths with both location names(to and from)
    const { paths, totalPaths, totalPages, totalPathsDistance } = await Path.getAllPaths(
      page,
      limit,
    );

    //return success reponse with path data
    res
      .status(200)
      .json({ success: true, paths, totalPaths, totalPages, page, totalPathsDistance});
  } catch (err) {
    //log error and return failure response
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch paths" });
  }
};

export const addPath = async (req, res) => {
  try {
    const { from_location_id, to_location_id } = req.body;

    //field validation
    if (!from_location_id || !to_location_id) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    //prevent creating path to the same location
    if (from_location_id === to_location_id) {
      return res.status(400).json({
        success: false,
        error: "Cannot create path to the same location",
      });
    }

    const existingPath = await Path.getPathBetween(
      from_location_id,
      to_location_id,
    );

    if (existingPath) {
      return res.status(400).json({
        success: false,
        message: "Path between these locations already exists",
        data: existingPath,
      });
    }

    const from = await Location.getLocationById(from_location_id);
    const to = await Location.getLocationById(to_location_id);

    if (!from || !to) {
      return res.status(404).json({ message: "Location not found" });
    }

    const distance = calculateDistance(
      from.latitude,
      from.longitude,
      to.latitude,
      to.longitude,
    );

    //create new path
    const newPaths = await Path.createPath({
      from_location_id,
      to_location_id,
      distance_meters: distance,
    });

    //return success response
    res.status(201).json({
      success: true,
      message: "Path added successfully (bidirectional)",
      path: newPaths,
    });
  } catch (err) {
    //log error and return failure response
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add path" });
  }
};

export const deletePath = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPath = await Path.getPathById(id);

    if (!existingPath)
      return res.status(400).json({
        success: false,
        message: "Path doesn't exist",
      });

    await Path.deletePath(id);

    return res.status(200).json({
      success: true,
      message: "Path deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to delete Path",
    });
  }
};
