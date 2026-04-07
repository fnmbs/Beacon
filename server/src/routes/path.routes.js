import express from "express";
import { getPaths, addPath, deletePath } from "../controllers/path.controllers.js";

const router = express.Router();

// List all paths
router.get("/", getPaths);

// Add a new path
router.post("/", addPath);

//delete a path
router.delete("/:id", deletePath)

export default router;
