import express from "express";
import {
  getCampusBoundary,
  updateCampusBoundary,
} from "../controllers/campus.controllers.js";

const router = express.Router();

router.get("/boundary", getCampusBoundary);
router.put("/boundary", updateCampusBoundary);

export default router;
