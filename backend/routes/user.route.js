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

router.post("/register", upload.single('profilePhoto'), register);
router.post('/login', login);
router.get("/logout", logout);

router.get("/portfolio/:username", getPublicProfile);

router.get('/profile', isAuthenticated, getProfile);

router.put('/profile', isAuthenticated, upload.fields([
     { name: 'profilePhoto', maxCount: 1 },
     { name: 'resume', maxCount: 1 },
     { name: 'videoPitch', maxCount: 1 }
]), updateProfile);

export default router;