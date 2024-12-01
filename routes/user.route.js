import express from "express";
import { deleteUser, getUser, getUserInfo, updateAvailability } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/jwt.js";

const router = express.Router();

router.get("/test", (req, res) => {
    res.send("Bro User Test API is Working!!")
})

router.delete("/:id", verifyToken, deleteUser);
router.get("/me", verifyToken, getUser);
router.get("/user/:id", getUserInfo);
router.put("/update-availability", updateAvailability);



export default router;
