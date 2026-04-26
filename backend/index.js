import dotenv from "dotenv";
dotenv.config({});

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./utils/db.js";
import dbReady from "./middlewares/dbReady.js";
import userRoute from "./routes/user.route.js";
import companyRoute from "./routes/company.route.js";
import jobRoute from "./routes/job.route.js";
import applicationRoute from "./routes/application.route.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

const PORT = process.env.PORT || 3000;

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ message: "Server is running", success: true });
});

app.use("/api/v1", dbReady);

app.use("/api/v1/user", userRoute);
app.use("/api/v1/company", companyRoute);
app.use("/api/v1/job", jobRoute);
app.use("/api/v1/application", applicationRoute);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server running at port ${PORT}`);
});
