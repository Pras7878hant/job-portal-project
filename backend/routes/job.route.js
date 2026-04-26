import express from 'express';
import isAuthenticated from '../middlewares/isAuthenticated.js';
import { authorizeRoles } from '../middlewares/authorizeRoles.js';
import {
     postJob,
     getAllJobs,
     getJobById,
     getRecruiterJobs,
     updateJob,
     deleteJob
} from '../controllers/job.controller.js';

const router = express.Router();

router.get('/', getAllJobs);
router.post('/post', isAuthenticated, authorizeRoles(['recruiter']), postJob);
router.get('/recruiter-jobs', isAuthenticated, authorizeRoles(['recruiter']), getRecruiterJobs);
router.get('/:id', getJobById);
router.put('/:id', isAuthenticated, authorizeRoles(['recruiter']), updateJob);
router.delete('/:id', isAuthenticated, authorizeRoles(['recruiter']), deleteJob);

export default router;
