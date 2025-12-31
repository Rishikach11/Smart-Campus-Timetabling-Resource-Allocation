const express = require("express");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

// Route for any authenticated user (Admin or Student) to get their data
router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user, // 'req.user' is populated by your authenticate middleware
  });
});

// Route strictly for Admin testing
router.get("/admin-only", authenticate, authorizeAdmin, (req, res) => {
  res.json({ 
    message: "If you see this, you are a verified Admin in the database." 
  });
});

module.exports = router;