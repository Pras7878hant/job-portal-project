// backend/models/user.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
     fullName: {
          type: String,
          default: ""
     },
     email: {
          type: String,
          required: true,
          unique: true
     },
     password: {
          type: String,
          required: true,
          minLength: 6
     },
     role: {
          type: String,
          enum: ['student', 'recruiter'],
          required: true
     },
     phone: {
          type: String,
          default: ""
     },
     profilePhoto: { // Added
          type: String,
          default: "" // You can set a default URL for a placeholder image here
     },
     bio: { // Added
          type: String,
          default: ""
     },
     skills: { // Added
          type: [String], // Array of strings for skills
          default: []
     },
     resume: { // Added
          type: String, // Assuming this stores a URL or file path
          default: ""
     }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);