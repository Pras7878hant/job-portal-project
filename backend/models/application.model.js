// Path: backend/models/application.model.js

import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
     job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
          required: true
     },
     applicant: { // Renamed from 'student' to 'applicant' as per your original model, but still references 'User'
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', // This should point to your User model
          required: true
     },
     resume: { // Added: Field for resume URL from Cloudinary
          type: String,
          required: true
     },
     coverLetter: { // Added: Field for optional cover letter text
          type: String,
          default: ''
     },
     status: {
          type: String,
          // Expanded enum to support recruiter workflow
          enum: ['pending', 'reviewed', 'interview', 'accepted', 'rejected'],
          default: 'pending'
     },
     appliedAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true });

// Using named export based on your provided controllers/models
export const Application = mongoose.model("Application", applicationSchema);