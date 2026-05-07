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
     profilePhoto: {
          type: String,
          default: "/assets/images/default-avatar.jpg"
     },
     bio: {
          type: String,
          default: ""
     },
     skills: {
          type: [String],
          default: []
     },
     resume: {
          type: String,
          default: ""
     }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
