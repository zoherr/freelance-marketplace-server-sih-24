import { trainRecommendationModel } from "../AiModel/recommandModel.js";
import gigModel from "../models/gig.model.js";
import Gig from "../models/gig.model.js";
import reviewModel from "../models/review.model.js";
import userModel from "../models/user.model.js";
import createError from "../utils/createError.js";
import * as tf from '@tensorflow/tfjs';

export const createGig = async (req, res, next) => {
    if (!req.isSeller)
        return next(createError(403, "Only sellers can create a gig!"));

    const newGig = new Gig({
        userId: req.userId,
        ...req.body,
    });

    try {
        const savedGig = await newGig.save();
        res.status(200).send("Gig has been Created!");
    } catch (err) {
        next(err);
    }
};
export const deleteGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (gig.userId !== req.userId)
            return next(createError(403, "You can delete only your gig!"));

        await Gig.findByIdAndDelete(req.params.id);
        res.status(200).send("Gig has been deleted!");
    } catch (err) {
        next(err);
    }
};

//
export const getUserInteractions = async () => {
    try {
        const reviews = await reviewModel.find();
        const users = await userModel.find();
        const gigs = await gigModel.find();

        return { reviews, users, gigs };
    } catch (error) {
        throw new Error("Error fetching interaction data: " + error);
    }
};

const skillCategories = ["JavaScript", "Python", "Java", "C#", "C++", "PHP", "Ruby", "Swift", "Kotlin",
    "TypeScript", "HTML", "CSS", "SQL", "NoSQL", "React", "Angular", "Vue.js",
    "Node.js", "Django", "Flask", "Ruby on Rails", "ASP.NET", "Laravel", "WordPress",
    "Shopify", "Magento", "RESTful APIs", "GraphQL", "UX/UI Design", "Adobe XD",
    "Sketch", "Figma", "Photoshop", "Illustrator", "InVision", "Wireframing",
    "Prototyping", "Responsive Design", "Mobile App Design", "Web Design", "Logo Design",
    "SEO", "SEM", "Google Ads", "Facebook Ads", "Social Media Marketing", "Content Marketing",
    "Email Marketing", "Affiliate Marketing", "PPC Advertising", "Marketing Strategy",
    "Google Analytics", "Conversion Rate Optimization", "Influencer Marketing", "Copywriting",
    "Content Writing", "Technical Writing", "Blogging", "Creative Writing", "Editing",
    "Proofreading", "Ghostwriting", "Resume Writing", "Grant Writing", "Scriptwriting",
    "Product Descriptions", "E-book Writing", "Video Editing", "Animation", "2D Animation",
    "3D Animation", "Motion Graphics", "After Effects", "Premiere Pro", "Final Cut Pro",
    "Video Production", "Explainer Videos", "Whiteboard Animation", "Accounting",
    "Financial Analysis", "Business Planning", "Market Research", "Project Management",
    "Business Development", "Data Analysis", "Excel", "QuickBooks", "Budgeting",
    "Forecasting", "Investment Analysis", "Data Entry", "Research", "Customer Service",
    "Email Management", "Calendar Management", "Personal Assistance", "Lead Generation",
    "Transcription", "Cybersecurity", "Network Administration", "System Administration",
    "IT Support", "Cloud Computing", "AWS", "Azure", "DevOps", "IT Consulting",
    "Database Administration", "Tutoring", "Course Creation", "Language Teaching",
    "Educational Content", "Illustration", "Art Direction", "Photography", "Music Composition",
    "Voice Over", "Sound Design", "3D Modeling", "Game Design", "Legal Writing",
    "Contract Drafting", "Legal Research", "Business Consulting", "HR Consulting",
    "Compliance"];

const encodeSkills = (skills) => {
    return skillCategories.map(category => skills.includes(category) ? 1 : 0);
};

const calculateSkillOverlap = (userSkills, gigSkills) => {
    const userSkillsSet = new Set(userSkills);
    const gigSkillsSet = new Set(gigSkills);

    const overlap = [...userSkillsSet].filter(skill => gigSkillsSet.has(skill)).length;
    return overlap;
};

const recommendGigs = (model, user, gigs) => {
    const userSkillsVector = encodeSkills(user.skills);
    const recommendedGigs = gigs.map(gig => {
        const gigSkillsVector = encodeSkills(gig.skills);
        const prediction = model.predict(tf.tensor2d([userSkillsVector.concat(gigSkillsVector)])).dataSync();
        return {
            ...gig.toObject(),
            predictedRating: prediction[0]
        };
    });
    recommendedGigs.sort((a, b) => b.predictedRating - a.predictedRating);
    return recommendedGigs;
};


export const getRecommendations = async (req, res, next) => {
    try {
        const userId = req.params.id;

        const { users, gigs } = await getUserInteractions();

        const model = await trainRecommendationModel(users, gigs);

        const user = await userModel.findById(userId);
        if (!user) {
            return next(createError(404, "User not found"));
        }


        const recommendedGigs = recommendGigs(model, user, gigs);

        res.status(200).json(recommendedGigs);
    } catch (error) {
        next(error);
    }
};

//
export const getGig = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) next(createError(404, "Gig not found!"));
        res.status(200).send(gig);
    } catch (err) {
        next(err);
    }
};
export const getGigs = async (req, res, next) => {
    const q = req.query;
    const filters = {
        ...(q.userId && { userId: q.userId }),
        ...(q.cat && { cat: q.cat }),
        ...((q.min || q.max) && {
            price: {
                ...(q.min && { $gt: q.min }),
                ...(q.max && { $lt: q.max }),
            },
        }),
        ...(q.search && { title: { $regex: q.search, $options: "i" } }),
    };
    try {
        const gigs = await Gig.find(filters).sort({ [q.sort]: -1 });
        res.status(200).send(gigs);
    } catch (err) {
        next(err);
    }
};
