import User from "../models/user.model.js";
import createError from "../utils/createError.js";

export const deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (req.userId !== user._id.toString()) {
        return next(createError(403, "You can delete only your account!"));
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("deleted.");
};

export const updateAvailability = async (req, res) => {
    const { userId, availability } = req.body;

    try {
        // Find the user by ID and update their availability status
        const user = await User.findByIdAndUpdate(userId, { availability }, { new: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Availability status updated successfully",
            user: {
                id: user._id,
                username: user.username,
                availability: user.availability,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating availability", error: error.message });
    }
};
export const getUserDetailsFromToken = async (req, res, next) => {
    const user = await User.findById(req.userId);

    res.status(200).send(user);
};
//
export const getUser = async (req, res, next) => {
    const user = await User.findById(req.userId);

    res.status(200).send(user);
};

export const getUserInfo = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        next(error);
    }
};
