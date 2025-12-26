const express = require("express");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const router = express.Router();

router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

router.get("/admin", authenticate, authorizeAdmin, (req, res) => {
  res.json({ message: "Welcome Admin" });
});

module.exports = router;
