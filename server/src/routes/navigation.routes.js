import express from "express";
import {navigate} from "../controllers/navigation.controllers.js"

const router = express.Router();

router.get("/", navigate)


export default router;
