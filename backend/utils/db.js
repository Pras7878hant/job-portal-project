import mongoose from "mongoose";

mongoose.set("bufferCommands", false);

const connectDB = async () => {
     try {
          if (!process.env.MONGO_URI) {
               throw new Error("MONGO_URI is not defined in .env");
          }

          await mongoose.connect(process.env.MONGO_URI);
          console.log('mongodb connected successfully');
     } catch (error) {
          console.error("MongoDB connection failed:", error.message);
     }
}
export default connectDB;
