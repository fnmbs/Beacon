import express from "express";
import { getLocations, addLocation, deleteLocation, searchLocationsByName, getTimetableForLocation } from "../controllers/location.controllers.js";

const router = express.Router();

router.get("/", getLocations);
router.get("/:id/timetable", getTimetableForLocation);
router.get("/search", searchLocationsByName);
router.post("/", addLocation);
router.delete("/:id", deleteLocation);

export default router;