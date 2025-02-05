const router = require('express').Router();
const pool = require("./db")
const multer = require("multer");
// Configure multer for handling image uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });

//Create design
router.post("/designs", upload.single("design_image"), async (req, res) => {
    try {
        const { design_number, category, product_type, diamond_cartage, price, description } = req.body;
        const design_image = req.file ? req.file.buffer : null; // Ensure image is properly handled

        const newDesign = await pool.query(
            "INSERT INTO designs (design_number, design_image, category, product_type, diamond_cartage, price, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [design_number, design_image, category, product_type, diamond_cartage, price, description]
        );

        res.json(newDesign.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});


//Read Designs
router.get("/designs", async (req, res) => {
    try {

        const allDesign = await pool.query("SELECT * FROM designs");

        res.json(allDesign.rows);

    } catch (err) {
        console.error(err.message);
    }
});

//Update Design
router.put("/designs/:design_number", upload.single("design_image"), async (req, res) => {
    try {
        const { design_number } = req.params;
        const { category, product_type, diamond_cartage, price, description } = req.body;
        const design_image = req.file ? req.file.buffer : null;

        const updateQuery = `
            UPDATE designs
            SET category = $1, product_type = $2, diamond_cartage = $3, price = $4, description = $5
            ${design_image ? ", design_image = $6" : ""}
            WHERE design_number = $${design_image ? 7 : 6} RETURNING *`;

        const values = design_image
            ? [category, product_type, diamond_cartage, price, description, design_image, design_number]
            : [category, product_type, diamond_cartage, price, description, design_number];

        const result = await pool.query(updateQuery, values);

        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ error: "Design not found" });
        }
    } catch (err) {
        console.error("Error updating design:", err);
        res.status(500).json({ error: "Server error" });
    }
});

//delete design
router.delete("/designs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM designs WHERE design_number = $1", [id]);
        res.json({ message: "Design deleted successfully!" });
    } catch (err) {
        console.error("Error deleting design:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

//get a design
router.get("/designs/:design_number", async (req, res) => {
    try {
        const { design_number } = req.params;
        const result = await pool.query("SELECT * FROM designs WHERE design_number = $1", [design_number]);

        if (result.rows.length > 0) {
            const design = result.rows[0];

            res.json({
                ...design,
                design_image: design.design_image
                    ? `data:image/png;base64,${design.design_image.toString("base64")}`
                    : null,
            });
        } else {
            res.status(404).json({ error: "Design not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server Error" });
    }
});



module.exports = router;