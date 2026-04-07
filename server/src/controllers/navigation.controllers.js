import {
  buildGraph,
  findShortestPath,
  estimateWalkingTime,
} from "../utils/navigation.js";
import pool from "../config/db.js";

export const navigate = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ message: "from and to are required" });
    }

    // Get all paths and locations
    const [pathResult, locationResult] = await Promise.all([
      pool.query("SELECT * FROM paths"),
      pool.query("SELECT id, name, latitude, longitude FROM locations"),
    ]);

    // Build a map of id -> name
    const locationMap = {};
    locationResult.rows.forEach((loc) => {
      locationMap[String(loc.id)] = loc.name;
    });

    // Build graph
    const graph = buildGraph(pathResult.rows);

    // Validate nodes exist
    if (!graph[from] || !graph[to]) {
      return res.status(404).json({ message: "Invalid locations" });
    }

    // Find shortest path
    const result = findShortestPath(graph, String(from), String(to));

    if (!result.path.length) {
      return res.status(404).json({ message: "No path found" });
    }

    // Estimate time
    const walkingTimeSeconds = estimateWalkingTime(result.totalDistance);
    const walkingTimeMinutes = Math.round(walkingTimeSeconds / 60);

    // Build steps
    const steps = [];
    for (let i = 0; i < result.path.length - 1; i++) {
      const fromId = result.path[i];
      const toId = result.path[i + 1];
      const distance = graph[fromId][toId];

      const fromLoc = locationResult.rows.find((l) => String(l.id) === fromId);
      const toLoc = locationResult.rows.find((l) => String(l.id) === toId);

      steps.push({
        from: locationMap[fromId] || fromId,
        to: locationMap[toId] || toId,
        distance,
        fromCoords: fromLoc ? [fromLoc.latitude, fromLoc.longitude] : null,
        toCoords: toLoc ? [toLoc.latitude, toLoc.longitude] : null,
      });
    }

    res.status(200).json({
      success: true,
      from: locationMap[String(from)] || from,
      to: locationMap[String(to)] || to,
      totalDistance: result.totalDistance,
      estimatedWalkingTimeSeconds: Math.round(walkingTimeSeconds),
      estimatedWalkingTimeMinutes: walkingTimeMinutes,
      steps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
