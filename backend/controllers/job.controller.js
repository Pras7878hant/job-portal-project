// Path: backend/controllers/job.controller.js

import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from '../models/company.model.js';
import { Application } from "../models/application.model.js"; // Import Application model

// Post a new job (typically by a recruiter/admin)
export const postJob = async (req, res) => {
     try {
          console.log('Job Controller: Received req.body for postJob:', req.body);
          const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;
          const userId = req.id; // Recruiter ID from isAuthenticated middleware

          // Basic validation for required fields
          if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position || !companyId) {
               return res.status(400).json({
                    message: "Something is missing. Please provide all required job details.",
                    success: false
               });
          }

          const job = await Job.create({
               title,
               description,
               requirements: Array.isArray(requirements) ? requirements : requirements.split(",").map(req => req.trim()),
               salary: Number(salary),
               location,
               jobType,
               experienceLevel,
               position,
               company: companyId,
               created_by: userId // Link the job to the recruiter who created it
          });

          // Optionally, add the new job's ID to the recruiter's `jobPosts` array in the User model
          await User.findByIdAndUpdate(userId, { $push: { jobPosts: job._id } });

          return res.status(201).json({
               message: "New job created successfully.",
               job,
               success: true
          });
     } catch (error) {
          console.error('Error in postJob:', error);
          return res.status(500).json({ message: "Server error creating job.", success: false, error: error.message });
     }
};

// Get all jobs (for students and general viewing)
export const getAllJobs = async (req, res) => {
     try {
          const keyword = req.query.keyword || ""; // For search functionality
          const query = {
               $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                    { location: { $regex: keyword, $options: "i" } },
                    { jobType: { $regex: keyword, $options: "i" } },
               ]
          };
          const jobs = await Job.find(query).populate({
               path: "company", // Populate company details
               select: 'name industry location website description' // Select specific fields to return
          }).sort({ createdAt: -1 });

          if (!jobs || jobs.length === 0) {
               return res.status(200).json({
                    message: "No jobs found matching your criteria.",
                    jobs: [],
                    success: true
               });
          }
          return res.status(200).json({
               jobs,
               success: true
          });
     } catch (error) {
          console.error('Error in getAllJobs:', error);
          return res.status(500).json({ message: "Server error fetching all jobs.", success: false, error: error.message });
     }
};

// Get job by ID (for detailed view)
export const getJobById = async (req, res) => {
     try {
          const jobId = req.params.id;
          const job = await Job.findById(jobId).populate({
               path: "company",
               select: 'name industry location website description' // Select specific fields
          });
          if (!job) {
               return res.status(404).json({
                    message: "Job not found.",
                    success: false
               });
          }
          return res.status(200).json({ job, success: true });
     } catch (error) {
          console.error('Error in getJobById:', error);
          return res.status(500).json({ message: "Server error fetching job by ID.", success: false, error: error.message });
     }
};

// Get jobs posted by the authenticated recruiter (includes applications and applicants)
export const getRecruiterJobs = async (req, res) => {
     console.log('--- getRecruiterJobs controller reached ---');
     try {
          const recruiterId = req.id; // User ID from isAuthenticated middleware

          // Validate recruiterId
          if (!recruiterId) {
               return res.status(401).json({
                    message: "Recruiter ID not found. Authentication required.",
                    success: false
               });
          }

          const jobs = await Job.find({ created_by: recruiterId })
               .populate({
                    path: 'company',
                    select: 'name industry location website description' // Select company fields you need
               })
               .populate({
                    path: 'applications', // Populate the applications array within each job
                    populate: {
                         path: 'applicant', // Further populate the applicant (User) details within each application
                         select: 'fullName email resume phone skills education experience' // Select specific student fields
                    }
               })
               .sort({ createdAt: -1 })
               .lean(); // Use .lean() for better performance if you don't need Mongoose Document methods

          if (!jobs || jobs.length === 0) {
               return res.status(200).json({
                    message: "No jobs posted by this recruiter yet.",
                    jobs: [],
                    success: true
               });
          }
          return res.status(200).json({
               jobs,
               success: true
          });
     } catch (error) {
          console.error('Error in getRecruiterJobs:', error);
          return res.status(500).json({ message: "Internal Server Error fetching recruiter jobs.", success: false, error: error.message });
     }
};

// Update an existing job
export const updateJob = async (req, res) => {
     try {
          const { id } = req.params;
          const recruiterId = req.id; // User ID from isAuthenticated
          const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;

          const job = await Job.findById(id);

          if (!job) {
               return res.status(404).json({ message: "Job not found.", success: false });
          }

          // Ensure only the creator can update the job
          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({ message: "You are not authorized to update this job.", success: false });
          }

          // Update fields if provided
          if (title) job.title = title;
          if (description) job.description = description;
          if (requirements !== undefined) job.requirements = Array.isArray(requirements) ? requirements : requirements.split(",").map(req => req.trim());
          if (salary) job.salary = Number(salary);
          if (location) job.location = location;
          if (jobType) job.jobType = jobType;
          if (experienceLevel) job.experienceLevel = experienceLevel;
          if (position) job.position = position;
          if (companyId) job.company = companyId;

          await job.save();

          res.status(200).json({ message: "Job updated successfully.", success: true, job });

     } catch (error) {
          console.error('Error updating job:', error);
          res.status(500).json({ message: "Internal Server Error while updating job.", success: false, error: error.message });
     }
};

// Delete a job
export const deleteJob = async (req, res) => {
     try {
          const { id } = req.params;
          const recruiterId = req.id; // User ID from isAuthenticated

          const job = await Job.findById(id);

          if (!job) {
               return res.status(404).json({ message: "Job not found.", success: false });
          }

          // Ensure only the creator can delete the job
          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({ message: "You are not authorized to delete this job.", success: false });
          }

          // Remove the job from the recruiter's jobPosts array
          await User.findByIdAndUpdate(recruiterId, { $pull: { jobPosts: job._id } });

          // IMPORTANT: Also delete associated applications for this job
          await Application.deleteMany({ job: id });

          await job.deleteOne(); // Use deleteOne() or findByIdAndDelete(id)

          res.status(200).json({ message: "Job and its applications deleted successfully.", success: true });

     } catch (error) {
          console.error('Error deleting job:', error);
          res.status(500).json({ message: "Internal Server Error while deleting job.", success: false, error: error.message });
     }
};