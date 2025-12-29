/**
 * File: routes/subjectsRoutes.js
 * Mục đích: Routes cho môn học
 */

import { Router } from "express";
import subjectController from "../controllers/subjectsController";

const router = Router();

// Lấy danh sách môn học
router.get("/", subjectController.getSubjects);

export default router;
