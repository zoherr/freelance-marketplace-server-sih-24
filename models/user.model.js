import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: {
            validator: (email) => {
                const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
                return emailRegex.test(email);
            },
            message: 'Invalid email format',
        },
    },
    password: {
        type: String,
        required: true,
    },
    img: {
        type: String,
        required: true,
        default: "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg"
    },
    cover: {
        type: String,
        required: true,
         default: "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg"
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        unique: true,
        type: String,
        required: false,
    },
    desc: {
        type: String,
        required: false,
    },
    payment:{
        type: Number,
        default: 0,
    },
    skills: [
        {
            type: String,
        },
    ],
    hourlyRate: {
        type: Number,
    },
    portfolio: {
        type: String, // Store URL or file path
    },
    availability: {
        type: Boolean, // Indicate if the freelancer is available for work
    },
    isSeller: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

export default mongoose.model("User", userSchema)
