// Path: backend/routes/application.route.js

import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js"; // Corrected to authorizeRoles

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

// Student checks if they have already applied for a specific job
// Route: /api/v1/application/check-status/:jobId
// No file upload involved, so upload.none() is good practice.
router.get("/check-status/:jobId", isAuthenticated, authorizeRoles(['student']), upload.none(), checkApplicationStatus);

// Recruiter gets applicants for a specific job
// Route: /api/v1/application/:jobId/applicants
// No file upload involved, so upload.none() is good practice.
router.get("/:jobId/applicants", isAuthenticated, authorizeRoles(['recruiter']), upload.none(), getApplicants);

// Get detailed information for a single application
// Route: /api/v1/application/:applicationId
// No file upload involved, so upload.none() is good practice.
router.get("/:applicationId", isAuthenticated, authorizeRoles(['recruiter', 'student']), upload.none(), getApplicationDetails);

// Recruiter updates application status
// Route: /api/v1/application/status/:applicationId
// No file upload involved, so upload.none() is good practice.
router.put("/status/:applicationId", isAuthenticated, authorizeRoles(['recruiter']), upload.none(), updateApplicationStatus);


export default router;