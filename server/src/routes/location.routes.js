import express from "express";
import { getLocations, addLocation, deleteLocation, searchLocationsByName, getTimetableForLocation } from "../controllers/location.controllers.js";

const router = express.Router();

router.get("/", getLocations);
router.get("/search", searchLocationsByName);
router.get("/:id/timetable", getTimetableForLocation);
router.post("/", addLocation);
router.delete("/:id", deleteLocation);

export default router;