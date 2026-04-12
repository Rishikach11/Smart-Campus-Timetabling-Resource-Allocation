const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prismaClient");
const { authenticate } = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json(user);
  } catch (error) {
  console.error(error); 
  res.status(500).json({ message: "User creation failed" });
}
});

router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        faculty: true,
        batch: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});


module.exports = router;
