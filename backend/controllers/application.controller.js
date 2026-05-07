import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import cloudinary from '../utils/cloudinary.js';
import getDataUri from '../utils/datauri.js';

export const applyForJob = async (req, res) => {
     try {
          const userId = req.id;
          const { jobId } = req.params;
          const { coverLetter } = req.body;

          if (!jobId) {
               return res.status(400).json({
                    message: "Job ID is required.",
                    success: false
               });
          }
          if (!userId) {
               return res.status(401).json({
                    message: "User not authenticated or ID not found.",
                    success: false
               });
          }

          const user = await User.findById(userId);
          if (!user || user.role !== 'student') {
               return res.status(403).json({
                    message: "Only students can apply for jobs.",
                    success: false
               });
          }

          const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
          if (existingApplication) {
               return res.status(400).json({
                    message: "You have already applied for this job.",
                    success: false
               });
          }

          const job = await Job.findById(jobId);
          if (!job) {
               return res.status(404).json({
                    message: "Job not found.",
                    success: false
               });
          }

          let resumeUrl = '';
          if (!req.file) {
               return res.status(400).json({ success: false, message: "Resume file is required for application." });
          }

          try {
               const fileUri = getDataUri(req.file);

               if (!fileUri || typeof fileUri.content !== 'string' || fileUri.content.length === 0) {
                    throw new Error("Failed to generate a valid Data URI from the file.");
               }

               const result = await cloudinary.uploader.upload(fileUri.content, {
                    folder: 'job_portal_resumes',
                    resource_type: 'raw'
               });

               resumeUrl = result.secure_url;
          } catch (uploadError) {
               return res.status(500).json({ success: false, message: "Failed to upload resume to cloud storage." });
          }

          const newApplication = await Application.create({
               job: jobId,
               applicant: userId,
               resume: resumeUrl,
               coverLetter: coverLetter || '',
               status: 'pending'
          });

          await Job.findByIdAndUpdate(jobId, { $addToSet: { applications: newApplication._id } });

          return res.status(201).json({
               message: "Job applied successfully.",
               success: true,
               application: newApplication
          });

     } catch (error) {
          return res.status(500).json({
               message: "Internal server error during application process.",
               success: false,
               error: error.message || "An unknown error occurred."
          });
     }
};

export const checkApplicationStatus = async (req, res) => {
     try {
          const { jobId } = req.params;
          const studentId = req.id; // User ID from isAuthenticated middleware

          if (!studentId) {
               return res.status(401).json({
                    message: "Unauthorized: User ID not found.",
                    success: false
               });
          }
          if (!jobId) {
               return res.status(400).json({
                    message: "Bad Request: Job ID is required.",
                    success: false
               });
          }

          const existingApplication = await Application.findOne({
               applicant: studentId,
               job: jobId
          });

          if (existingApplication) {
               return res.status(200).json({
                    message: "You have already applied for this job.",
                    applied: true, // Frontend expects 'applied' boolean
                    status: existingApplication.status,
                    success: true
               });
          } else {
               return res.status(200).json({
                    message: "You have not applied for this job yet.",
                    applied: false, // Frontend expects 'applied' boolean
                    success: true
               });
          }
     } catch (error) {
          console.error("Error in checkApplicationStatus:", error);
          return res.status(500).json({
               message: "Server error checking application status.",
               success: false,
               error: error.message
          });
     }
};

export const getAppliedJobs = async (req, res) => {
     try {
          const userId = req.id;
          if (!userId) {
               return res.status(401).json({ success: false, message: "User not authenticated." });
          }

          const applications = await Application.find({ applicant: userId }).sort({ createdAt: -1 }).populate({
               path: 'job',
               populate: {
                    path: 'company',
                    select: 'name'
               },
               select: 'title company location jobType' // Select fields you need from the job
          });

          if (!applications || applications.length === 0) {
               return res.status(200).json({
                    message: "No applications found.",
                    success: true,
                    applications: []
               });
          }
          return res.status(200).json({
               applications,
               success: true
          });
     } catch (error) {
          console.error("Error in getAppliedJobs:", error);
          return res.status(500).json({
               message: "Internal server error fetching applied jobs.",
               success: false,
               error: error.message
          });
     }
};

export const getApplicants = async (req, res) => {
     try {
          const { jobId } = req.params; // Changed from id to jobId to match route
          const recruiterId = req.id;

          if (!recruiterId) {
               return res.status(401).json({ success: false, message: "Unauthorized: Recruiter ID not found." });
          }
          if (!jobId) {
               return res.status(400).json({ success: false, message: "Job ID is required." });
          }

          const job = await Job.findById(jobId);
          if (!job) {
               return res.status(404).json({
                    message: 'Job not found.',
                    success: false
               });
          }
          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({
                    message: 'You are not authorized to view applicants for this job.',
                    success: false
               });
          }

          const applications = await Application.find({ job: jobId })
               .populate({
                    path: 'applicant',
                    select: 'fullName email phone skills education experience' // Select specific user fields for applicant
               })
               .sort({ appliedAt: -1 })
               .lean();

          if (!applications || applications.length === 0) {
               return res.status(200).json({
                    message: 'No applicants for this job yet.',
                    success: true,
                    applicants: []
               });
          }

          return res.status(200).json({
               message: 'Applicants fetched successfully.',
               applicants: applications,
               success: true
          });
     } catch (error) {
          console.error("Error in getApplicants:", error);
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid Job ID format." });
          }
          return res.status(500).json({
               message: "Internal server error fetching applicants.",
               success: false,
               error: error.message
          });
     }
};

export const updateApplicationStatus = async (req, res) => {
     try {
          const { status } = req.body;
          const { applicationId } = req.params; // Changed from id to applicationId to match route
          const recruiterId = req.id;

          if (!applicationId) {
               return res.status(400).json({ success: false, message: "Application ID is required." });
          }
          if (!recruiterId) {
               return res.status(401).json({ success: false, message: "Unauthorized: Recruiter ID not found." });
          }

          const validStatuses = ['pending', 'reviewed', 'interview', 'accepted', 'rejected'];
          if (!status || !validStatuses.includes(status.toLowerCase())) {
               return res.status(400).json({
                    message: "Invalid or missing application status provided. Valid statuses: " + validStatuses.join(', '),
                    success: false
               });
          }

          const application = await Application.findById(applicationId).populate({
               path: 'job',
               select: 'created_by' // Only need created_by from job to check authorization
          });

          if (!application) {
               return res.status(404).json({
                    message: "Application not found.",
                    success: false
               });
          }

          if (!application.job || application.job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({
                    message: "You are not authorized to update this application status.",
                    success: false
               });
          }

          application.status = status.toLowerCase();
          await application.save();

          return res.status(200).json({
               message: "Application status updated successfully.",
               success: true,
               application
          });

     } catch (error) {
          console.error("Error in updateApplicationStatus:", error);
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid Application ID format." });
          }
          return res.status(500).json({
               message: "Internal server error while updating application status.",
               success: false,
               error: error.message
          });
     }
};

export const getApplicationDetails = async (req, res) => {
     try {
          const { applicationId } = req.params; // Changed from id to applicationId to match route
          const userId = req.id;
          const role = req.role;

          if (!applicationId) {
               return res.status(400).json({ success: false, message: "Application ID is required." });
          }
          if (!userId || !role) {
               return res.status(401).json({
                    message: "User not authenticated or role not found.",
                    success: false
               });
          }

          const application = await Application.findById(applicationId)
               .populate({
                    path: 'job',
                    select: 'title company location jobType salary experienceLevel created_by', // Select job details
                    populate: {
                         path: 'company',
                         select: 'name' // Populate company name within job
                    }
               })
               .populate({
                    path: 'applicant',
                    select: 'fullName email resume phone skills education experience' // Select applicant details
               })
               .lean(); // Use .lean() for faster query execution

          if (!application) {
               return res.status(404).json({
                    message: "Application not found.",
                    success: false
               });
          }

          if (role === 'student' && application.applicant._id.toString() !== userId.toString()) {
               return res.status(403).json({
                    message: "You are not authorized to view this application.",
                    success: false
               });
          }

          if (role === 'recruiter' && (!application.job || application.job.created_by.toString() !== userId.toString())) {
               return res.status(403).json({
                    message: "You are not authorized to view this application as it's not for your job.",
                    success: false
               });
          }

          return res.status(200).json({
               message: "Application details fetched successfully.",
               application: application,
               success: true
          });

     } catch (error) {
          console.error("Error in getApplicationDetails:", error);
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid application ID format." });
          }
          return res.status(500).json({
               message: "Internal server error while fetching application details.",
               success: false,
               error: error.message
          });
     }
};
