import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from '../models/job.model.js';

export const register = async (req, res) => {
     try {
          const fullName = req.body.fullName?.trim();
          const email = req.body.email?.trim().toLowerCase();
          const phone = (req.body.phone || req.body.phoneNumber)?.trim();
          const password = req.body.password?.trim();
          const role = req.body.role?.trim().toLowerCase();

          if (!fullName || !email || !phone || !password || !role) {
               return res.status(400).json({
                    message: "All required fields are missing (Full Name, Email, Phone, Password, Role).",
                    success: false
               });
          }

          let profilePhoto = '';
         
          if (req.file) { 
               const fileUri = getDataUri(req.file);
               const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
               profilePhoto = cloudResponse.secure_url;
            
          }

          const existingUser = await User.findOne({ email });
          if (existingUser) {
               return res.status(400).json({
                    message: 'User already exists with this email.',
                    success: false,
               });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          await User.create({
               fullName,
               email,
               phone,
               password: hashedPassword,
               role,
               profilePhoto: profilePhoto || '/assets/images/default-avatar.jpg',
               bio: '',
               skills: []
          });

          return res.status(201).json({
               message: "Account created successfully.",
               success: true
          });

     } catch (error) {
          console.error('Register error:', error);
          if (error.name === 'ValidationError') {
               const messages = Object.values(error.errors).map(val => val.message);
               return res.status(400).json({ message: `Validation error: ${messages.join(', ')}`, success: false });
          }
          return res.status(500).json({ message: "Server error during registration.", success: false });
     }
};

export const login = async (req, res) => {
     try {
          const email = req.body.email?.trim().toLowerCase();
          const password = req.body.password?.trim();
          const role = req.body.role?.trim().toLowerCase();

          if (!email || !password || !role) {
               return res.status(400).json({
                    message: "All fields are required",
                    success: false
               });
          }

          let user = await User.findOne({ email });
          if (!user) {
               return res.status(400).json({
                    message: "User not found.",
                    success: false,
               });
          }

          const isPasswordMatch = await bcrypt.compare(password, user.password);
          if (!isPasswordMatch) {
               return res.status(400).json({
                    message: "Incorrect password.",
                    success: false,
               });
          }

          if (user.role !== role) {
               return res.status(400).json({
                    message: "Account doesn't exist with current role.",
                    success: false
               });
          }

          const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1d' });

          const userToSend = {
               _id: user._id,
               fullName: user.fullName,
               email: user.email,
               phone: user.phone,
               role: user.role,
               profilePhoto: user.profilePhoto,
               bio: user.bio,
               skills: user.skills,
               resume: user.resume
          };

          return res.status(200)
               .cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' })
               .json({
                    message: `Welcome back ${user.fullName}`,
                    user: userToSend,
                    token,
                    success: true
               });

     } catch (error) {
          console.error('Login error:', error);
          return res.status(500).json({ message: "Server error", success: false });
     }
};

export const logout = async (req, res) => {
     try {
          return res.status(200).cookie("token", "", { maxAge: 0 }).json({
               message: "Logged out successfully.",
               success: true
          });
     } catch (error) {
          console.error('Logout error:', error);
          return res.status(500).json({ message: "Server error", success: false });
     }
};


export const getProfile = async (req, res) => {
     try {
          const userId = req.id;
          if (!userId) {
               return res.status(401).json({ success: false, message: "User not authenticated." });
          }

          const user = await User.findById(userId).select('-password');

          if (!user) {
               return res.status(404).json({ message: "User not found.", success: false });
          }

          const userProfile = {
               _id: user._id,
               fullName: user.fullName || '',
               email: user.email,
               phone: user.phone || '',
               role: user.role,
               profilePhoto: user.profilePhoto || '/assets/images/default-avatar.jpg',
               bio: user.bio || '',
               skills: user.skills || [],
               resume: user.resume || ''
          };

          res.status(200).json({ user: userProfile, success: true });
     } catch (error) {
          console.error('Error fetching profile:', error);
          res.status(500).json({ message: "Internal Server Error while fetching profile.", success: false, error: error.message });
     }
};

export const updateProfile = async (req, res) => {
     try {
          const userId = req.id;
          if (!userId) {
               return res.status(401).json({ success: false, message: "Unauthorized: User ID not found." });
          }

          const user = await User.findById(userId);

          if (!user) {
               return res.status(404).json({ message: "User not found.", success: false });
          }

          const {
               fullName,
               phone,
               bio,
               skills,
               password
          } = req.body;

          if (fullName !== undefined) user.fullName = fullName;
          if (phone !== undefined) user.phone = phone;
          if (bio !== undefined) user.bio = bio;

          if (skills !== undefined) {
               if (Array.isArray(skills)) {
                    user.skills = skills.map(s => s.trim()).filter(Boolean);
               } else if (typeof skills === 'string') {
                    user.skills = skills.split(',').map(s => s.trim()).filter(s => s !== '');
               } else {
                    user.skills = [];
               }
          }

          if (password) {
               if (password.length < 6) {
                    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
               }
               user.password = await bcrypt.hash(password, 10);
          }

          if (req.files && req.files['profilePhoto'] && req.files['profilePhoto'][0]) {
               const profilePhotoFile = req.files['profilePhoto'][0];

               if (user.profilePhoto && user.profilePhoto.includes('res.cloudinary.com')) {
                    const publicIdMatch = user.profilePhoto.match(/\/profile_photos\/([^/.]+)\./);
                    if (publicIdMatch && publicIdMatch[1]) {
                         const publicId = `profile_photos/${publicIdMatch[1]}`;
                         await cloudinary.uploader.destroy(publicId).catch(() => {});
                    }
               }

               const fileUri = getDataUri(profilePhotoFile);
               const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    folder: 'profile_photos',
                    resource_type: 'image'
               });
               user.profilePhoto = cloudResponse.secure_url;
          }

          if (user.role === 'student' && req.files && req.files['resume'] && req.files['resume'][0]) {
               const resumeFile = req.files['resume'][0];

               if (user.resume && user.resume.includes('res.cloudinary.com')) {
                    const publicIdMatch = user.resume.match(/\/resumes\/([^/.]+)\./);
                    if (publicIdMatch && publicIdMatch[1]) {
                         const publicId = `resumes/${publicIdMatch[1]}`;
                         await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() => {});
                    }
               }

               const fileUri = getDataUri(resumeFile);
               const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                    folder: 'resumes',
                    resource_type: 'raw'
               });
               user.resume = cloudResponse.secure_url;
          }

          await user.save();

          const updatedUser = {
               _id: user._id,
               fullName: user.fullName,
               email: user.email,
               phone: user.phone,
               role: user.role,
               profilePhoto: user.profilePhoto,
               bio: user.bio,
               skills: user.skills,
               resume: user.resume,
               createdAt: user.createdAt,
               updatedAt: user.updatedAt
          };

          return res.status(200).json({
               message: "Profile updated successfully.",
               user: updatedUser,
               success: true
          });

     } catch (error) {
          console.error('Error updating profile:', error);
          if (error.name === 'ValidationError') {
               const messages = Object.values(error.errors).map(err => err.message);
               return res.status(400).json({ success: false, message: `Validation error: ${messages.join(', ')}` });
          }
          return res.status(500).json({ success: false, message: "Server error while updating profile.", error: error.message });
     }
};

export const getAppliedJobs = async (req, res) => {
     try {
          const userId = req.id;
          const user = await User.findById(userId)
               .populate({
                    path: 'appliedJobs.job',
                    select: 'title company location jobType',
                    populate: {
                         path: 'company',
                         select: 'name'
                    }
               });

          if (!user || user.role !== 'student') {
               return res.status(403).json({ message: "Access denied. Not a student.", success: false });
          }
          res.status(200).json({ appliedJobs: user.appliedJobs, success: true });
     } catch (error) {
          console.error('Error fetching applied jobs:', error);
          res.status(500).json({ message: "Internal Server Error while fetching applied jobs.", success: false, error: error.message });
     }
};

export const getAllApplicants = async (req, res) => {
     try {
          const recruiterId = req.id;

          const postedJobs = await Job.find({ created_by: recruiterId }).select('_id');
          const postedJobIds = postedJobs.map(job => job._id);

          const applicants = await User.find({
               'appliedJobs.job': { $in: postedJobIds }
          })
               .select('fullName email phone resume appliedJobs')
               .populate({
                    path: 'appliedJobs.job',
                    match: { _id: { $in: postedJobIds } },
                    select: 'title company location jobType',
                    populate: {
                         path: 'company',
                         select: 'name'
                    }
               });

          let allApplicantsData = [];
          applicants.forEach(applicant => {
               applicant.appliedJobs.forEach(app => {
                    if (postedJobIds.some(jobId => jobId.equals(app.job._id))) {
                         allApplicantsData.push({
                              _id: app._id,
                              job: app.job,
                              user: {
                                   _id: applicant._id,
                                   fullName: applicant.fullName,
                                   email: applicant.email,
                                   phone: applicant.phone,
                                   resume: applicant.resume
                              },
                              appliedDate: app.appliedDate,
                              status: app.status
                         });
                    }
               });
          });

          res.status(200).json({ applicants: allApplicantsData, success: true });

     } catch (error) {
          console.error('Error fetching all applicants:', error);
          res.status(500).json({ message: "Internal Server Error while fetching applicants.", success: false, error: error.message });
     }
};

export const updateApplicationStatus = async (req, res) => {
     try {
          const { id } = req.params;
          const { status } = req.body;
          const recruiterId = req.id;

          if (!['Pending', 'Selected', 'Rejected'].includes(status)) {
               return res.status(400).json({ message: "Invalid status provided.", success: false });
          }

          const user = await User.findOne({ 'appliedJobs._id': id });

          if (!user) {
               return res.status(404).json({ message: "Application not found.", success: false });
          }

          const application = user.appliedJobs.id(id);
          if (!application) {
               return res.status(404).json({ message: "Application not found within user's applications.", success: false });
          }

          const job = await Job.findById(application.job);
          if (!job || job.created_by.toString() !== recruiterId.toString()) {
               return res.status(403).json({ message: "You are not authorized to update this application.", success: false });
          }

          application.status = status;
          await user.save();

          res.status(200).json({ message: "Application status updated successfully.", success: true, application });

     } catch (error) {
          console.error('Error updating application status:', error);
          res.status(500).json({ message: "Internal Server Error while updating application status.", success: false, error: error.message });
     }
};

export const applyJob = async (req, res) => {
     try {
          const userId = req.id;
          const { jobId } = req.params;

          if (!jobId) {
               return res.status(400).json({ message: "Job ID is required.", success: false });
          }

          const user = await User.findById(userId);
          if (!user) {
               return res.status(404).json({ message: "User not found.", success: false });
          }

          if (user.role !== 'student') {
               return res.status(403).json({ message: "Only students can apply for jobs.", success: false });
          }

          const job = await Job.findById(jobId);
          if (!job) {
               return res.status(404).json({ message: "Job not found.", success: false });
          }

          const hasApplied = user.appliedJobs.some(application =>
               application.job.toString() === jobId
          );

          if (hasApplied) {
               return res.status(400).json({ message: "You have already applied for this job.", success: false });
          }

          user.appliedJobs.push({
               job: jobId,
               appliedDate: new Date(),
               status: 'Pending'
          });

          await user.save();

          return res.status(200).json({
               message: "Job applied successfully.",
               success: true
          });

     } catch (error) {
          console.error('Error applying for job:', error);
          res.status(500).json({ message: "Internal Server Error while applying for job.", success: false, error: error.message });
     }
};
