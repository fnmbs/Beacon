import express from "express";
import {scheduleCourse} from "../controllers/timetable.controllers.js"

const router = express.Router();

router.post("/", scheduleCourse);

export default router;
