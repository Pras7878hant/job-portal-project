// Path: backend/controllers/application.controller.js

import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js"; // Ensure User model is imported if used for population or other logic
import cloudinary from 'cloudinary'; // Import Cloudinary library
import { getDataUri } from '../middlewares/multer.js'; // Import the getDataUri helper from your multer middleware

// Configure Cloudinary.
// IMPORTANT: For production, consider moving this configuration to your main entry file (e.g., server.js, app.js, index.js)
// or a dedicated configuration file that runs once when your server starts.
// This prevents repeated configuration if this controller is loaded multiple times.
cloudinary.v2.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
});

// Student applies for a job
export const applyForJob = async (req, res) => {
     console.log("\n--- applyForJob controller started ---");
     try {
          const userId = req.id; // User ID from isAuthenticated middleware
          const { jobId } = req.params; // Get jobId from URL parameters (e.g., /apply/60c72b2f9f1b2c0015a9e3a1)
          const { coverLetter } = req.body; // Get cover letter from form data (via req.body)

          console.log(`Applying for Job ID: ${jobId} by User ID: ${userId}`);
          console.log(`Received coverLetter: "${coverLetter}"`);
          console.log("Multer processed file (req.file):", req.file ? {
               originalname: req.file.originalname,
               mimetype: req.file.mimetype,
               size: req.file.size,
               bufferLength: req.file.buffer ? req.file.buffer.length : 'N/A' // Check buffer existence and length
          } : "No file received by Multer (req.file is undefined/null)");

          // Basic validation for required fields
          if (!jobId) {
               console.error("Validation Error: Job ID is missing.");
               return res.status(400).json({
                    message: "Job ID is required.",
                    success: false
               });
          }
          if (!userId) {
               console.error("Authentication Error: User ID not found in request (isAuthenticated middleware issue?).");
               return res.status(401).json({
                    message: "User not authenticated or ID not found.",
                    success: false
               });
          }

          // Check if student has already applied for this job to prevent duplicate applications
          const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
          if (existingApplication) {
               console.log("Application Conflict: User has already applied for this job.");
               return res.status(400).json({
                    message: "You have already applied for this job.",
                    success: false
               });
          }

          // Verify if the job exists
          const job = await Job.findById(jobId);
          if (!job) {
               console.error(`Job Not Found: Job with ID ${jobId} does not exist.`);
               return res.status(404).json({
                    message: "Job not found.",
                    success: false
               });
          }

          // --- Handle Resume Upload to Cloudinary ---
          let resumeUrl = ''; // Initialize resumeUrl to an empty string

          // Check if a file was actually provided and processed by Multer
          if (!req.file) {
               console.error("File Upload Error: No resume file was uploaded or processed by Multer.");
               // Decide if resume is strictly required. For job applications, it usually is.
               return res.status(400).json({ success: false, message: "Resume file is required for application." });
          }

          try {
               // Use getDataUri to convert the file buffer into a Cloudinary-ready Data URI
               const fileUri = getDataUri(req.file);

               // Ensure getDataUri returned valid content
               if (!fileUri || typeof fileUri.content !== 'string' || fileUri.content.length === 0) {
                    console.error("Data URI Generation Error: getDataUri returned invalid or empty content.", fileUri);
                    throw new Error("Failed to generate a valid Data URI from the file.");
               }

               console.log(`Uploading file (mimetype: ${req.file.mimetype}, size: ${req.file.size} bytes) to Cloudinary...`);
               // Upload the Data URI content to Cloudinary
               const result = await cloudinary.v2.uploader.upload(fileUri.content, {
                    folder: 'job_portal_resumes', // Organize uploads into a specific folder in your Cloudinary account
                    resource_type: 'raw', // Use 'raw' for non-image files like PDFs, 'auto' is also an option but 'raw' is safer for documents.
                    // public_id: `resume-${userId}-${jobId}-${Date.now()}` // Optional: give a custom public ID
               });

               resumeUrl = result.secure_url; // Cloudinary provides secure_url for HTTPS access
               console.log('Resume successfully uploaded to Cloudinary:', resumeUrl);

          } catch (uploadError) {
               console.error('Cloudinary Upload Fatal Error:', uploadError.message || uploadError);
               // If Cloudinary upload fails, send an appropriate error response
               return res.status(500).json({ success: false, message: "Failed to upload resume to cloud storage." });
          }
          // --- End Resume Upload Handling ---

          // Create the new application record in the database
          const newApplication = await Application.create({
               job: jobId,
               applicant: userId,
               resume: resumeUrl, // Store the Cloudinary URL of the uploaded resume
               coverLetter: coverLetter || '', // Default to empty string if no cover letter provided
               status: 'pending' // Initial status of the application
          });

          // IMPORTANT: Update the Job model to include this new application ID
          // This creates a bi-directional link. Ensure 'applications' field exists in your Job model schema.
          if (job.applications) { // Check if the applications array exists on the job document
               job.applications.push(newApplication._id);
               await job.save(); // Save the updated job document
               console.log(`Application ID ${newApplication._id} added to Job ID ${jobId}'s applications array.`);
          } else {
               // This case should ideally not happen if your Job schema is correct,
               // but it's a good warning if the 'applications' array is missing.
               console.warn(`Job model for ID ${jobId} does not have an 'applications' array. Application not linked.`);
          }

          console.log("Application created successfully:", newApplication._id);
          return res.status(201).json({
               message: "Job applied successfully.",
               success: true,
               application: newApplication
          });

     } catch (error) {
          console.error("Catch-all Error in applyForJob controller:", error.message || error);
          // Generic error response for any unexpected errors during the process
          return res.status(500).json({
               message: "Internal server error during application process.",
               success: false,
               error: error.message || "An unknown error occurred."
          });
     } finally {
          console.log("--- applyForJob controller finished ---\n");
     }
};

// Check if a student has already applied for a specific job (updated for frontend)
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

// Get jobs applied by a specific student
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

// Get all applicants for a specific job (for recruiters to view)
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
          // Ensure the recruiter requesting applicants is the one who created the job
          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({
                    message: 'You are not authorized to view applicants for this job.',
                    success: false
               });
          }

          // Fetch applications and populate applicant details
          const applications = await Application.find({ job: jobId })
               .populate({
                    path: 'applicant',
                    select: 'fullName email phone skills education experience' // Select specific user fields for applicant
               })
               .sort({ appliedAt: -1 }) // Sort by application date, if 'appliedAt' field exists. Otherwise, consider 'createdAt'.
               .lean(); // Use .lean() for faster query execution if you don't need Mongoose Document methods

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

// Recruiter updates application status
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

          // Check if the recruiter updating the status is the one who created the job
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

// Get single application details (for 'View Details' page for both student and recruiter)
export const getApplicationDetails = async (req, res) => {
     try {
          const { applicationId } = req.params; // Changed from id to applicationId to match route
          const userId = req.id;
          const role = req.role;

          console.log("Application details request:", {
               applicationId,
               userId,
               role
          });

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
               console.log("Application details rejected: application not found", { applicationId });
               return res.status(404).json({
                    message: "Application not found.",
                    success: false
               });
          }

          // Authorization check: Student can only view their own applications
          if (role === 'student' && application.applicant._id.toString() !== userId.toString()) {
               console.log("Application details rejected: student does not own application", {
                    applicationId,
                    requesterId: userId,
                    applicantId: application.applicant._id.toString()
               });
               return res.status(403).json({
                    message: "You are not authorized to view this application.",
                    success: false
               });
          }

          // Authorization check: Recruiter can only view applications for jobs they created
          // Ensure application.job and application.job.created_by exist before comparing
          if (role === 'recruiter' && (!application.job || application.job.created_by.toString() !== userId.toString())) {
               console.log("Application details rejected: recruiter does not own job", {
                    applicationId,
                    requesterId: userId,
                    jobOwnerId: application.job?.created_by?.toString()
               });
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
