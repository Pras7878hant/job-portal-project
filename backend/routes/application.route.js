import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

import { upload } from '../middlewares/multer.js';

import {
     applyForJob,
     getApplicants,
     getAppliedJobs,
     updateApplicationStatus,
     getApplicationDetails,
     checkApplicationStatus
} from "../controllers/application.controller.js";

const router = express.Router();

router.post("/apply/:jobId", isAuthenticated, authorizeRoles(['student']), upload.single('resume'), applyForJob);


router.get("/get", isAuthenticated, authorizeRoles(['student']), upload.none(), getAppliedJobs);

router.get("/check-status/:jobId", isAuthenticated, authorizeRoles(['student']), upload.none(), checkApplicationStatus);

router.get("/:jobId/applicants", isAuthenticated, authorizeRoles(['recruiter']), upload.none(), getApplicants);

router.get("/:applicationId", isAuthenticated, authorizeRoles(['recruiter', 'student']), upload.none(), getApplicationDetails);

router.put("/status/:applicationId", isAuthenticated, authorizeRoles(['recruiter']), upload.none(), updateApplicationStatus);


export default router;