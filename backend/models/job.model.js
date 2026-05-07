import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
     {
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
          salary: {
               type: Number,
               required: true,
               min: 0
          },
          location: {
               type: String,
               required: true,
               trim: true
          },
          jobType: {
               type: String,
               required: true,
               enum: ['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship']
          },
          experienceLevel: {
               type: String,
               required: true,
               enum: ['Entry-Level', 'Mid-Level', 'Senior-Level', 'Director', 'Executive']
          },
          position: {
               type: String,
               required: true,
               trim: true
          },
          company: {
               type: mongoose.Schema.Types.ObjectId,
               ref: 'Company',
               required: true
          },
          created_by: {
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