// Path: backend/routes/user.route.js

import express from "express";
import {
     login,
     logout,
     register,
     getProfile, // For fetching logged-in user profile
     updateProfile,
     // Removed: getAppliedJobs, getAllApplicants, updateApplicationStatus as these are handled by application.controller.js/route.js
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { upload } from '../middlewares/multer.js'; // *** Corrected: Only import 'upload' ***

const router = express.Router();

// Public Routes
// For registration, if you expect a file upload (e.g., a default profile photo),
// you'd use `upload.single()` here. Assuming 'profilePhoto' is the field name.
// If register doesn't involve a file upload, use `upload.none()` or remove Multer.
router.post("/register", upload.single('profilePhoto'), register); // Assuming profilePhoto can be uploaded during registration
router.post('/login', login); // Login uses JSON from the frontend.
router.get("/logout", logout);

// Protected Routes (User must be authenticated)
router.get('/profile', isAuthenticated, getProfile); // Fetch logged-in user profile

// Update User Profile with optional file uploads
// Using `upload.fields` to handle multiple distinct file fields (e.g., profile photo AND resume)
// The field names 'profilePhoto' and 'resume' must match the 'name' attribute in your frontend forms.
router.put('/profile', isAuthenticated, upload.fields([
     { name: 'profilePhoto', maxCount: 1 }, // For profile picture
     { name: 'resume', maxCount: 1 }      // For student's resume
]), updateProfile);

// ---

// IMPORTANT NOTE ON DUPLICATE ROUTES:
// The routes below (commented out) are now **exclusively managed**
// within `backend/routes/application.route.js` and their respective
// controllers in `backend/controllers/application.controller.js`.
// It's crucial to keep related routes together to maintain a clean and
// manageable API structure. Do NOT uncomment these here.

// Student specific routes (protected) - These are handled in application.route.js
// router.get('/applied-jobs', isAuthenticated, getAppliedJobs);
// router.post('/apply-job/:jobId', isAuthenticated, applyJob);

// Recruiter specific routes (protected) - These are handled in application.route.js
// router.get('/all-applicants', isAuthenticated, getAllApplicants);
// router.put('/application/:id/status', isAuthenticated, updateApplicationStatus);

export default router;
