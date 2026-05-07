
import { Company } from "../models/company.model.js"; // Assuming your model is company.model.js

export const registerCompany = async (req, res) => {
     try {

          const { name, description, website, location } = req.body;

          if (!name || !description) { // 'name' and 'description' are essential for company
               return res.status(400).json({
                    message: "Company name and description are required.",
                    success: false
               });
          }

          if (!req.id) {
               console.error('Error: User ID (req.id) is missing in registerCompany controller.');
               return res.status(401).json({
                    message: "Not authorized: User information missing from request.",
                    success: false
               });
          }

          let company = await Company.findOne({ name: name, userId: req.id });
          if (company) {
               return res.status(409).json({
                    message: `You already have a company named "${name}". Please choose a different name.`,
                    success: false
               });
          }

          const companyData = {
               name: name,
               description: description,
               website: website,
               location: location, // Added location here
               userId: req.id
          };


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

export const updateCompany = async (req, res) => {
     try {

          const { name, description, website, location } = req.body;

          const updateData = {};
          if (name) updateData.name = name;
          if (description) updateData.description = description;
          if (website) updateData.website = website;
          if (location) updateData.location = location; // Added location to updateData

          if (!req.id) {
               return res.status(401).json({ message: "Not authorized: User ID is missing.", success: false });
          }


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

export const companyController = {
     registerCompany,
     getCompany,
     getCompanyById,
     updateCompany,
     deleteCompany, // Make sure to export deleteCompany if you're using this export style
};
