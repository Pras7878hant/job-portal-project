import mongoose from "mongoose";

const dbReady = (req, res, next) => {
     if (mongoose.connection.readyState === 1) {
          return next();
     }

     return res.status(503).json({
          message: "Database is not connected. Please check MongoDB Atlas Network Access/IP whitelist.",
          success: false
     });
};

export default dbReady;
