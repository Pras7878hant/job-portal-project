import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDataUri } from "../middlewares/multer.js";
import cloudinary from "../utils/cloudinary.js";
import { Job } from "../models/job.model.js";
import { sendOtpEmail } from "../utils/email.js";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const sendSignupOtp = async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const phone = (req.body.phone || req.body.phoneNumber)?.trim();
    const password = req.body.password?.trim();
    const role = req.body.role?.trim().toLowerCase();

    if (!fullName || !email || !phone || !password || !role) {
      return res
        .status(400)
        .json({ message: "All required fields are missing.", success: false });
    }

    let user = await User.findOne({ email });

    if (user && user.accountStatus !== "Unverified") {
      return res
        .status(400)
        .json({
          message: "User already exists and is verified.",
          success: false,
        });
    }

    let profilePhoto = "";
    if (req.file) {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      profilePhoto = cloudResponse.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    if (user && user.accountStatus === "Unverified") {
      user.fullName = fullName;
      user.phone = phone;
      user.password = hashedPassword;
      user.role = role;
      user.otp = otp;
      user.otpExpires = otpExpires;
      if (profilePhoto) user.profilePhoto = profilePhoto;
      await user.save();
    } else {
      const baseUsername = fullName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const username = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

      user = await User.create({
        fullName,
        username,
        email,
        phone,
        password: hashedPassword,
        role,
        profilePhoto: profilePhoto || "/assets/images/default-avatar.jpg",
        otp,
        otpExpires,
        accountStatus: "Unverified",
      });
    }

    const emailSent = await sendOtpEmail(email, fullName, otp);
    if (!emailSent) {
      return res
        .status(500)
        .json({ message: "Failed to send OTP email.", success: false });
    }

    return res
      .status(200)
      .json({ message: "OTP sent to email.", success: true });
  } catch (error) {
    console.error("Send signup OTP error:", error);
    return res.status(500).json({ message: "Server error.", success: false });
  }
};

export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found.", success: false });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP.", success: false });
    }

    user.otp = "";
    user.otpExpires = null;

    if (user.role === "recruiter") {
      user.accountStatus = "Pending";
    } else {
      user.accountStatus = "Active";
    }

    await user.save();

    const message =
      user.role === "recruiter"
        ? "Account verified. Your recruiter account is pending admin approval."
        : "Account verified successfully. You can now log in.";

    return res
      .status(200)
      .json({ message, success: true, status: user.accountStatus });
  } catch (error) {
    console.error("Verify signup OTP error:", error);
    return res.status(500).json({ message: "Server error.", success: false });
  }
};

export const sendLoginOtp = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password?.trim();
    const role = req.body.role?.trim().toLowerCase();

    if (!email || !password || !role) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found.", success: false });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res
        .status(400)
        .json({ message: "Incorrect password.", success: false });

    if (user.role !== role)
      return res
        .status(400)
        .json({
          message: "Account doesn't exist with current role.",
          success: false,
        });

    if (user.accountStatus === "Unverified") {
      return res
        .status(400)
        .json({
          message: "Account unverified. Please sign up again.",
          success: false,
        });
    }
    if (user.accountStatus === "Pending") {
      return res
        .status(403)
        .json({
          message: "Your recruiter account is pending admin approval.",
          success: false,
        });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const emailSent = await sendOtpEmail(email, user.fullName, otp);
    if (!emailSent)
      return res
        .status(500)
        .json({ message: "Failed to send OTP email.", success: false });

    return res
      .status(200)
      .json({ message: "OTP sent to email.", success: true });
  } catch (error) {
    console.error("Send login OTP error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res
        .status(400)
        .json({ message: "User not found.", success: false });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP.", success: false });
    }

    user.otp = "";
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "1d" },
    );

    const userToSend = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePhoto: user.profilePhoto,
      bio: user.bio,
      skills: user.skills,
      resume: user.resume,
      videoPitch: user.videoPitch,
      isPortfolioPublic: user.isPortfolioPublic,
      portfolioTheme: user.portfolioTheme,
    };

    return res
      .status(200)
      .cookie("token", token, {
        maxAge: 1 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "none",
        secure: true
      })
      .json({
        message: `Welcome back ${user.fullName}`,
        user: userToSend,
        token,
        success: true,
      });
  } catch (error) {
    console.error("Verify login OTP error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully.", success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated." });

    const user = await User.findById(userId).select("-password");
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found.", success: false });

    res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res
      .status(500)
      .json({
        message: "Internal Server Error while fetching profile.",
        success: false,
        error: error.message,
      });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      username,
      isPortfolioPublic: true,
    }).select("-password -email -phone");
    if (!user)
      return res
        .status(404)
        .json({
          message: "Portfolio not found or is set to private.",
          success: false,
        });

    res.status(200).json({ user, success: true });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User ID not found." });

    const user = await User.findById(userId);
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found.", success: false });

    const {
      fullName,
      phone,
      bio,
      skills,
      password,
      isPortfolioPublic,
      portfolioTheme,
    } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (isPortfolioPublic !== undefined)
      user.isPortfolioPublic = isPortfolioPublic;
    if (portfolioTheme !== undefined) user.portfolioTheme = portfolioTheme;

    if (skills !== undefined) {
      if (Array.isArray(skills))
        user.skills = skills.map((s) => s.trim()).filter(Boolean);
      else if (typeof skills === "string")
        user.skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s !== "");
      else user.skills = [];
    }

    if (password) {
      if (password.length < 6)
        return res
          .status(400)
          .json({
            success: false,
            message: "Password must be at least 6 characters long.",
          });
      user.password = await bcrypt.hash(password, 10);
    }

    if (
      req.files &&
      req.files["profilePhoto"] &&
      req.files["profilePhoto"][0]
    ) {
      const profilePhotoFile = req.files["profilePhoto"][0];
      if (
        user.profilePhoto &&
        user.profilePhoto.includes("res.cloudinary.com")
      ) {
        const publicIdMatch = user.profilePhoto.match(
          /\/profile_photos\/([^/.]+)\./,
        );
        if (publicIdMatch && publicIdMatch[1])
          await cloudinary.uploader
            .destroy(`profile_photos/${publicIdMatch[1]}`)
            .catch(() => {});
      }
      const fileUri = getDataUri(profilePhotoFile);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "profile_photos",
        resource_type: "image",
      });
      user.profilePhoto = cloudResponse.secure_url;
    }

    if (
      user.role === "student" &&
      req.files &&
      req.files["resume"] &&
      req.files["resume"][0]
    ) {
      const resumeFile = req.files["resume"][0];
      if (user.resume && user.resume.includes("res.cloudinary.com")) {
        const publicIdMatch = user.resume.match(/\/resumes\/([^/.]+)\./);
        if (publicIdMatch && publicIdMatch[1])
          await cloudinary.uploader
            .destroy(`resumes/${publicIdMatch[1]}`, { resource_type: "raw" })
            .catch(() => {});
      }
      const fileUri = getDataUri(resumeFile);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "resumes",
        resource_type: "raw",
      });
      user.resume = cloudResponse.secure_url;
    }

    if (
      user.role === "student" &&
      req.files &&
      req.files["videoPitch"] &&
      req.files["videoPitch"][0]
    ) {
      const videoPitchFile = req.files["videoPitch"][0];
      if (user.videoPitch && user.videoPitch.includes("res.cloudinary.com")) {
        const publicIdMatch = user.videoPitch.match(
          /\/video_pitches\/([^/.]+)\./,
        );
        if (publicIdMatch && publicIdMatch[1])
          await cloudinary.uploader
            .destroy(`video_pitches/${publicIdMatch[1]}`, {
              resource_type: "video",
            })
            .catch(() => {});
      }
      const fileUri = getDataUri(videoPitchFile);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: "video_pitches",
        resource_type: "video",
      });
      user.videoPitch = cloudResponse.secure_url;
    }

    await user.save();
    return res
      .status(200)
      .json({ message: "Profile updated successfully.", user, success: true });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error while updating profile.",
        error: error.message,
      });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.id).populate({
      path: "appliedJobs.job",
      select: "title company location jobType",
      populate: { path: "company", select: "name" },
    });
    if (!user || user.role !== "student")
      return res
        .status(403)
        .json({ message: "Access denied.", success: false });
    res.status(200).json({ appliedJobs: user.appliedJobs, success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

export const getAllApplicants = async (req, res) => {
  try {
    const postedJobs = await Job.find({ created_by: req.id }).select("_id");
    const postedJobIds = postedJobs.map((job) => job._id);

    const applicants = await User.find({
      "appliedJobs.job": { $in: postedJobIds },
    })
      .select("fullName email phone resume videoPitch appliedJobs profilePhoto")
      .populate({
        path: "appliedJobs.job",
        match: { _id: { $in: postedJobIds } },
        select: "title company location jobType",
        populate: { path: "company", select: "name" },
      });

    let allApplicantsData = [];
    applicants.forEach((applicant) => {
      applicant.appliedJobs.forEach((app) => {
        if (postedJobIds.some((jobId) => jobId.equals(app.job._id))) {
          allApplicantsData.push({
            _id: app._id,
            job: app.job,
            appliedDate: app.appliedDate,
            status: app.status,
            user: {
              _id: applicant._id,
              fullName: applicant.fullName,
              email: applicant.email,
              phone: applicant.phone,
              resume: applicant.resume,
              videoPitch: applicant.videoPitch,
              profilePhoto: applicant.profilePhoto,
            },
          });
        }
      });
    });

    res.status(200).json({ applicants: allApplicantsData, success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Selected", "Rejected"].includes(status))
      return res
        .status(400)
        .json({ message: "Invalid status provided.", success: false });

    const user = await User.findOne({ "appliedJobs._id": id });
    if (!user)
      return res
        .status(404)
        .json({ message: "Application not found.", success: false });

    const application = user.appliedJobs.id(id);
    const job = await Job.findById(application.job);
    if (!job || job.created_by.toString() !== req.id.toString())
      return res.status(403).json({ message: "Unauthorized.", success: false });

    application.status = status;
    await user.save();

    res
      .status(200)
      .json({
        message: "Status updated successfully.",
        success: true,
        application,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};

export const applyJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const user = await User.findById(req.id);
    if (!user || user.role !== "student")
      return res
        .status(403)
        .json({ message: "Only students can apply.", success: false });

    const job = await Job.findById(jobId);
    if (!job)
      return res
        .status(404)
        .json({ message: "Job not found.", success: false });

    if (user.appliedJobs.some((app) => app.job.toString() === jobId)) {
      return res
        .status(400)
        .json({ message: "Already applied.", success: false });
    }

    user.appliedJobs.push({
      job: jobId,
      appliedDate: new Date(),
      status: "Pending",
    });
    await user.save();

    return res
      .status(200)
      .json({ message: "Job applied successfully.", success: true });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Internal Server Error",
        success: false,
        error: error.message,
      });
  }
};
