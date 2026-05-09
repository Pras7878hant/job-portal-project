import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { Company } from '../models/company.model.js';
import { Application } from "../models/application.model.js";

export const postJob = async (req, res) => {
     try {
          const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;
          const userId = req.id;

          if (!title || !description || !requirements || !salary || !location || !jobType || !experienceLevel || !position || !companyId) {
               return res.status(400).json({
                    message: "Something is missing. Please provide all required job details.",
                    success: false
               });
          }

          const job = await Job.create({
               title,
               description,
               requirements: Array.isArray(requirements) ? requirements.map(req => req.trim()).filter(Boolean) : requirements.split(",").map(req => req.trim()).filter(Boolean),
               salary: Number(salary),
               location,
               jobType,
               experienceLevel,
               position,
               company: companyId,
               created_by: userId
          });

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

export const getAllJobs = async (req, res) => {
     try {
          const keyword = req.query.keyword || "";
          const query = {
               $or: [
                    { title: { $regex: keyword, $options: "i" } },
                    { description: { $regex: keyword, $options: "i" } },
                    { location: { $regex: keyword, $options: "i" } },
                    { jobType: { $regex: keyword, $options: "i" } },
               ]
          };
          const jobs = await Job.find(query).populate({
               path: "company",
               select: 'name industry location website description'
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

export const getJobById = async (req, res) => {
     try {
          const jobId = req.params.id;
          const job = await Job.findById(jobId).populate({
               path: "company",
               select: 'name industry location website description'
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

export const getRecruiterJobs = async (req, res) => {
     try {
          const recruiterId = req.id;

          if (!recruiterId) {
               return res.status(401).json({
                    message: "Recruiter ID not found. Authentication required.",
                    success: false
               });
          }

          const jobs = await Job.find({ created_by: recruiterId })
               .populate({
                    path: 'company',
                    select: 'name industry location website description'
               })
               .populate({
                    path: 'applications',
                    populate: {
                         path: 'applicant',
                         // I added profilePhoto and videoPitch to the select array so the frontend can access them
                         select: 'fullName email resume phone skills profilePhoto videoPitch'
                    }
               })
               .sort({ createdAt: -1 })
               .lean();

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

export const updateJob = async (req, res) => {
     try {
          const { id } = req.params;
          const recruiterId = req.id;
          const { title, description, requirements, salary, location, jobType, experienceLevel, position, companyId } = req.body;

          const job = await Job.findById(id);

          if (!job) {
               return res.status(404).json({ message: "Job not found.", success: false });
          }

          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({ message: "You are not authorized to update this job.", success: false });
          }

          if (title) job.title = title;
          if (description) job.description = description;
          if (requirements !== undefined) job.requirements = Array.isArray(requirements) ? requirements.map(req => req.trim()).filter(Boolean) : requirements.split(",").map(req => req.trim()).filter(Boolean);
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

export const deleteJob = async (req, res) => {
     try {
          const { id } = req.params;
          const recruiterId = req.id;

          const job = await Job.findById(id);

          if (!job) {
               return res.status(404).json({ message: "Job not found.", success: false });
          }

          if (job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({ message: "You are not authorized to delete this job.", success: false });
          }

          await Application.deleteMany({ job: id });

          await job.deleteOne();

          res.status(200).json({ message: "Job and its applications deleted successfully.", success: true });

     } catch (error) {
          console.error('Error deleting job:', error);
          res.status(500).json({ message: "Internal Server Error while deleting job.", success: false, error: error.message });
     }
};