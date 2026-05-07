// Path: backend/routes/user.route.js

import express from "express";
import {
     login,
     logout,
     register,
     getProfile,
     updateProfile,
     getPublicProfile
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { upload } from '../middlewares/multer.js';

const router = express.Router();

// Public Routes
router.post("/register", upload.single('profilePhoto'), register);
router.post('/login', login);
router.get("/logout", logout);

// New Public Route for Portfolios
router.get("/portfolio/:username", getPublicProfile);

// Protected Routes
router.get('/profile', isAuthenticated, getProfile);

// Update User Profile with optional file uploads
router.put('/profile', isAuthenticated, upload.fields([
     { name: 'profilePhoto', maxCount: 1 },
     { name: 'resume', maxCount: 1 }
]), updateProfile);

export default router;