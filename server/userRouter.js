const router = require('express').Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const pool = require("./db"); // PostgreSQL connection
require("dotenv").config();


// Configure Multer for profile picture uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Secret key for JWT
const SECRET_KEY = process.env.JWT_SECRET || "D3CE626C-C945-418E-A407-0CEDE5E4CB5B";

//  REGISTER USER
router.post("/register", upload.single("profile_pic"), async (req, res) => {
    try {
        const { username, email, password, roleid } = req.body;
        const profile_pic = req.file ? req.file.buffer : null; // Convert image to bytea

        // Check if user already exists
        const userExists = await pool.query("SELECT * FROM pdm_user WHERE Email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user into database
        const newUser = await pool.query(
            "INSERT INTO pdm_user (Username, Email, Password, RoleID, Profile_pic) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [username, email, hashedPassword, roleid, profile_pic]
        );

        res.json({ message: "User registered successfully!", user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// LOGIN USER
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await pool.query("SELECT * FROM pdm_user WHERE Email = $1", [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare hashed passwords
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Generate JWT token
        const token = jwt.sign({ userid: user.rows[0].userid, role: user.rows[0].roleid }, SECRET_KEY, { expiresIn: "1h" });

        res.json({ message: "Login successful!", token, user: user.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// GET USER PROFILE
router.get("/profile/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await pool.query("SELECT * FROM pdm_user WHERE UserID = $1", [id]);

        if (user.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

// MIDDLEWARE TO PROTECT ROUTES
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ error: "Access Denied" });

    try {
        const verified = jwt.verify(token.split(" ")[1], SECRET_KEY);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Token" });
    }
};

// GET ALL USERS (ADMIN ONLY)
router.get("/users", authenticateToken, async (req, res) => {
    if (req.user.role !== 1) {
        return res.status(403).json({ error: "Access denied" });
    }

    try {
        const users = await pool.query("SELECT * FROM pdm_user");
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;