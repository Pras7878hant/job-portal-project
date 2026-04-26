// backend/controllers/company.controller.js

import { Company } from "../models/company.model.js"; // Assuming your model is company.model.js
// Removed imports for datauri and cloudinary as logo functionality is being removed
// import getDataUri from "../utils/datauri.js";
// import cloudinary from "../utils/cloudinary.js";

// @desc    Register a new company
// @route   POST /api/v1/company/register
// @access  Private (Recruiter) - Assuming route is protected and req.id is set by middleware
export const registerCompany = async (req, res) => {
     try {
          // Debugging logs - keep them if you need, remove otherwise
          console.log('req.body:', req.body);
          // console.log('req.file:', req.file); // Removed as logo is gone

          // Destructure 'location' along with other fields
          const { name, description, website, location } = req.body;
          // const file = req.file; // Removed as logo is gone

          // --- Server-side Validation ---
          if (!name || !description) { // 'name' and 'description' are essential for company
               console.log('Company name or description is missing:', req.body);
               return res.status(400).json({
                    message: "Company name and description are required.",
                    success: false
               });
          }

          // Ensure user ID is available from middleware (req.id should be the recruiter's ID)
          if (!req.id) {
               console.error('Error: User ID (req.id) is missing in registerCompany controller.');
               return res.status(401).json({
                    message: "Not authorized: User information missing from request.",
                    success: false
               });
          }

          // Check if a company with this name already exists for the logged-in user (recruiter)
          let company = await Company.findOne({ name: name, userId: req.id });
          if (company) {
               return res.status(409).json({
                    message: `You already have a company named "${name}". Please choose a different name.`,
                    success: false
               });
          }

          // Prepare company data for creation
          const companyData = {
               name: name,
               description: description,
               website: website,
               location: location, // Added location here
               userId: req.id
          };

          // Removed logo upload logic
          // if (file) {
          //     try {
          //         const fileUri = getDataUri(file);
          //         const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          //             resource_type: 'auto'
          //         });
          //         companyData.logo = cloudResponse.secure_url;
          //     } catch (uploadError) {
          //         console.error('Cloudinary upload error:', uploadError);
          //         return res.status(500).json({ success: false, message: "Failed to upload company logo." });
          //     }
          // }

          // Create the company in the database
          company = await Company.create(companyData);

          return res.status(201).json({
               message: "Company registered successfully.",
               company,
               success: true
          });

     } catch (error) {
          console.error('Register company error:', error);

          if (error.name === 'ValidationError') {
               const messages = Object.values(error.errors).map(val => val.message);
               return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
          } else if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: `Invalid data format for ${error.path}: ${error.value}.` });
          } else if (error.code === 11000) {
               return res.status(409).json({ success: false, message: 'A company with similar details already exists (duplicate key error).' });
          }

          return res.status(500).json({
               message: "Failed to register company. An unexpected internal server error occurred.",
               success: false
          });
     }
};

// @desc    Get companies associated with the logged-in user (recruiter)
// @route   GET /api/v1/company/get
// @access  Private (Recruiter) - Assuming route is protected and req.id is set
export const getCompany = async (req, res) => {
     try {
          const userId = req.id;

          if (!userId) {
               return res.status(401).json({ message: "Not authorized: User ID is missing.", success: false });
          }

          const companies = await Company.find({ userId: userId });

          if (!companies || companies.length === 0) {
               return res.status(200).json({
                    message: "No companies found for this user.",
                    companies: [],
                    success: true
               });
          }
          return res.status(200).json({
               companies,
               success: true
          });
     } catch (error) {
          console.error('Get company error:', error);
          return res.status(500).json({
               message: "Failed to retrieve companies. Server error.",
               success: false
          });
     }
};

// @desc    Get company by ID
// @route   GET /api/v1/company/:id
// @access  Public (or Private depending on your design)
export const getCompanyById = async (req, res) => {
     try {
          const companyId = req.params.id;
          const company = await Company.findById(companyId);
          if (!company) {
               return res.status(404).json({
                    message: "Company not found.",
                    success: false
               });
          }
          return res.status(200).json({
               company,
               success: true
          });
     } catch (error) {
          console.error('Get company by ID error:', error);
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid company ID format." });
          }
          return res.status(500).json({
               message: "Server error",
               success: false
          });
     }
};

// @desc    Update company details
// @route   PUT /api/v1/company/:id
// @access  Private (Recruiter - should also check ownership)
export const updateCompany = async (req, res) => {
     try {
          console.log('req.body:', req.body); // Debug log

          // Destructure 'location' from req.body
          const { name, description, website, location } = req.body;
          // const file = req.file; // Removed as logo is gone

          const updateData = {};
          // Only update fields that are provided
          if (name) updateData.name = name;
          if (description) updateData.description = description;
          if (website) updateData.website = website;
          if (location) updateData.location = location; // Added location to updateData

          // Ensure user ID is available (ownership check)
          if (!req.id) {
               return res.status(401).json({ message: "Not authorized: User ID is missing.", success: false });
          }

          // Removed logo upload for update
          // if (file) {
          //     try {
          //         const fileUri = getDataUri(file);
          //         const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
          //             resource_type: 'auto'
          //         });
          //         updateData.logo = cloudResponse.secure_url;
          //     } catch (uploadError) {
          //         console.error('Cloudinary update upload error:', uploadError);
          //         return res.status(500).json({ success: false, message: "Failed to upload new company logo." });
          //     }
          // }

          // Find company by ID AND ensure the logged-in user owns it
          const company = await Company.findOneAndUpdate(
               { _id: req.params.id, userId: req.id },
               updateData,
               { new: true, runValidators: true }
          );

          if (!company) {
               return res.status(404).json({
                    message: "Company not found or you are not authorized to update it.",
                    success: false
               });
          }
          return res.status(200).json({
               message: "Company information updated.",
               company,
               success: true
          });
     } catch (error) {
          console.error('Update company error:', error);
          if (error.name === 'ValidationError') {
               const messages = Object.values(error.errors).map(val => val.message);
               return res.status(400).json({ success: false, message: `Validation Error: ${messages.join(', ')}` });
          }
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid company ID format." });
          }
          return res.status(500).json({
               message: "Server error",
               success: false
          });
     }
};

// @desc    Delete a company
// @route   DELETE /api/v1/company/:id
// @access  Private (Recruiter - should check ownership)
export const deleteCompany = async (req, res) => {
     try {
          const companyId = req.params.id;
          const userId = req.id;

          if (!userId) {
               return res.status(401).json({ message: "Not authorized: User ID is missing.", success: false });
          }

          const company = await Company.findOneAndDelete({ _id: companyId, userId: userId });

          if (!company) {
               return res.status(404).json({ message: "Company not found or you are not authorized to delete it.", success: false });
          }

          return res.status(200).json({ message: "Company deleted successfully.", success: true });

     } catch (error) {
          console.error('Delete company error:', error);
          if (error.name === 'CastError') {
               return res.status(400).json({ success: false, message: "Invalid company ID format." });
          }
          return res.status(500).json({ message: "Server error.", success: false });
     }
};

// Export all controller functions
export const companyController = {
     registerCompany,
     getCompany,
     getCompanyById,
     updateCompany,
     deleteCompany, // Make sure to export deleteCompany if you're using this export style
};