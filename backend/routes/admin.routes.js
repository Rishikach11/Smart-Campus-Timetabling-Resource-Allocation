const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const prisma = new PrismaClient();
const router = express.Router();

// Add New Faculty
router.post("/faculty", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, departmentId, loadLimit } = req.body; // departmentId from frontend
    const newFaculty = await prisma.faculty.create({
      data: { 
        name, 
        email, 
        // Map frontend 'loadLimit' to Prisma 'maxWeeklyLoad'
        maxWeeklyLoad: parseInt(loadLimit), 
        // Map frontend 'departmentId' to Prisma 'departmentId'
        departmentId: parseInt(departmentId),
        // Providing a default for maxLoad since it's required in your schema
        maxLoad: parseInt(loadLimit) 
      }
    });
    res.status(201).json(newFaculty);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add faculty. Ensure Department ID is valid." });
  }
});

// Add New Room
// Add New Room
// backend/routes/admin.routes.js

// Add New Room
router.post("/room", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { roomNumber, capacity, type } = req.body;
    const newRoom = await prisma.room.create({
      data: {
        name: roomNumber, // Maps to 'name' in schema
        capacity: parseInt(capacity),
        type: type, // Must be 'CLASSROOM' or 'LAB'
        isLab: type === "LAB"
      }
    });
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(400).json({ error: "Failed to add room. Name must be unique." });
  }
});

// Get all Rooms
router.get("/room", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// backend/routes/admin.routes.js

// Add New Course
// backend/routes/admin.routes.js

// Add New Course
router.post("/course", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, code, type, departmentId, weeklyHours } = req.body;
    const newCourse = await prisma.course.create({
      data: {
        name,
        code,
        type: type || "THEORY",
        departmentId: parseInt(departmentId),
        weeklyHours: parseInt(weeklyHours) || 4
      }
    });
    res.status(201).json(newCourse);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "Failed to add course. Ensure Department ID exists." });
  }
});

// Get all Courses with their Department
router.get("/course", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: { department: true }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// Get all Faculty members (Add this to admin.routes.js)
router.get("/faculty", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const facultyList = await prisma.faculty.findMany({
      include: { department: true } // This joins the department name
    });
    res.json(facultyList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

module.exports = router;