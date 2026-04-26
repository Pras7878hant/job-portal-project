// Path: backend/routes/company.route.js

import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
// Import deleteCompany as well
import { getCompany, getCompanyById, registerCompany, updateCompany, deleteCompany } from "../controllers/company.controller.js";

const router = express.Router();


router.route("/register").post(isAuthenticated, registerCompany);


router.route("/get").get(isAuthenticated, getCompany);

router.route("/get/:id").get(isAuthenticated, getCompanyById);


router.route("/:id").put(isAuthenticated, updateCompany); // 
router.route("/:id").delete(isAuthenticated, deleteCompany);


export default router;