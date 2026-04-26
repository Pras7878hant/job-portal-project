// Path: backend/models/job.model.js

import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
     title: {
          type: String,
          required: true,
          trim: true
     },
     description: {
          type: String,
          required: true
     },
     requirements: {
          type: [String],
          required: true
     },
     salary: { // <-- Is it exactly 'salary'?
          type: Number,
          required: true,
          min: 0
     },
     location: { // <-- Is it exactly 'location'?
          type: String,
          required: true,
          trim: true
     },
     jobType: { // This one is already saving, so it's correct
          type: String,
          required: true,
          enum: ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship']
     },
     experienceLevel: { // This one is already saving, so it's correct
          type: String,
          required: true,
          enum: ['Entry-Level', 'Mid-Level', 'Senior-Level', 'Director', 'Executive']
     },
     position: { // <-- Is it exactly 'position'?
          type: String,
          required: true,
          trim: true
     },
     company: { // <-- Is it exactly 'company' here? Not 'companyId' or something else?
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Company',
          required: true
     },
     created_by: { // <-- Is it exactly 'created_by' here? Not 'userId' or 'recruiterId'?
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
     },
     applications: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Application'
     }]
}, { timestamps: true });

export const Job = mongoose.model("Job", jobSchema);