import * as Campus from "../models/campus.models.js";

const normalizeBoundaryPoint = (point) => {
  const latitude = Number(point?.latitude ?? point?.lat);
  const longitude = Number(
    point?.longitude ?? point?.lng ?? point?.lon ?? point?.long,
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return { latitude, longitude };
};

export const getCampusBoundary = async (_req, res) => {
  try {
    const boundary = await Campus.getCampusBoundary();
    return res.status(200).json({
      success: true,
      data: boundary,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch campus boundary",
    });
  }
};

export const updateCampusBoundary = async (req, res) => {
  try {
    const {
      name = "OOU Campus",
      boundary,
      buffer_meters,
      bufferMeters,
      gate_location_id,
      gateLocationId,
    } = req.body;

    if (!Array.isArray(boundary)) {
      return res.status(400).json({
        success: false,
        message: "boundary must be an array of latitude/longitude points",
      });
    }

    const normalizedBoundary = boundary.map(normalizeBoundaryPoint);
    if (
      normalizedBoundary.length < 3 ||
      normalizedBoundary.some((point) => point === null)
    ) {
      return res.status(400).json({
        success: false,
        message: "boundary must contain at least 3 valid points",
      });
    }

    const normalizedBuffer = Number(buffer_meters ?? bufferMeters ?? 150);
    if (
      !Number.isFinite(normalizedBuffer) ||
      normalizedBuffer < 0 ||
      normalizedBuffer > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "buffer_meters must be a number between 0 and 2000",
      });
    }

    const updated = await Campus.updateCampusBoundary({
      name: `${name || "OOU Campus"}`.trim(),
      boundary: normalizedBoundary,
      buffer_meters: Math.round(normalizedBuffer),
      gate_location_id: gate_location_id || gateLocationId || null,
    });

    return res.status(200).json({
      success: true,
      message: "Campus boundary updated",
      data: updated,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update campus boundary",
    });
  }
};
