import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.route.js";
import gigRoute from "./routes/gig.route.js";
import orderRoute from "./routes/order.route.js";
import conversationRoute from "./routes/conversation.route.js";
import messageRoute from "./routes/message.route.js";
import reviewRoute from "./routes/review.route.js";
import authRoute from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// Initialize express app
const app = express();

// Load environment variables
dotenv.config();

// MongoDB connection function
mongoose.set("strictQuery", true);
const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://workforzoher:zoher4878@corders-corner.jgzyzwz.mongodb.net/HyperGeek', {
        });
        console.log("Connected to MongoDB!");
    } catch (error) {
        console.log("Error connecting to MongoDB:", error);
    }
};

// Middleware
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/gigs", gigRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    const errorStatus = err.status || 500;
    const errorMessage = err.message || "Something went wrong!";
    return res.status(errorStatus).send(errorMessage);
});

// Start the server
app.listen(8000, () => {
    connectDB();
    console.log("Server is running on port 8000!");
});
