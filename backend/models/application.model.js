import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
     job: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Job',
          required: true
     },
     applicant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
     },
     resume: {
          type: String,
          required: true
     },
     coverLetter: {
          type: String,
          default: ''
     },
     status: {
          type: String,
          enum: ['pending', 'reviewed', 'interview', 'accepted', 'rejected'],
          default: 'pending'
     },
     appliedAt: {
          type: Date,
          default: Date.now
     }
}, { timestamps: true });

export const Application = mongoose.model("Application", applicationSchema);