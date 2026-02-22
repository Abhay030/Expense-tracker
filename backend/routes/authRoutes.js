const express = require("express");
const rateLimit = require("express-rate-limit");
const { protect } = require("../middleware/authMiddleware");
const { validate } = require("../middleware/validate");

const { registerUser, loginUser, getUserInfo } = require("../controllers/authController");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();

// Rate limit only login/register (brute-force targets), NOT getUser
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many login attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/register", authLimiter, validate('register'), registerUser);
router.post("/login", authLimiter, validate('login'), loginUser);
router.get("/getUser", protect, getUserInfo);
router.post("/upload-image", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.status(200).json({ imageUrl });
});

module.exports = router;