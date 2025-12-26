const express = require("express");
const bcrypt = require("bcrypt");
const prisma = require("../prismaClient");

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
    res.status(500).json({ message: "User creation failed" });
  }
});

module.exports = router;
