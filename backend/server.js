const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Home route
app.get("/", (req, res) => {
  res.send("Employee Leave Management System API is running!");
});

// Database health check
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");

    res.json({
      success: true,
      message: "Backend and MySQL connected successfully!",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });
  }
});

// Get all leave requests from MySQL
app.get("/api/leaves", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, employee, type,
      DATE_FORMAT(start_date, '%Y-%m-%d') AS start,
      DATE_FORMAT(end_date, '%Y-%m-%d') AS end,
      days, status
      FROM leave_requests
      ORDER BY id DESC
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve leave requests.",
    });
  }
});

// Submit a leave request to MySQL
app.post("/api/leaves", async (req, res) => {
  try {
    const { employee, type, start, end } = req.body;

    if (!employee || !type || !start || !end) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const startDate = new Date(start + "T00:00:00Z");
    const endDate = new Date(end + "T00:00:00Z");

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(start) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime()) ||
      startDate.toISOString().slice(0, 10) !== start ||
      endDate.toISOString().slice(0, 10) !== end ||
      endDate < startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter valid leave dates.",
      });
    }

    const days =
      Math.round((endDate - startDate) / 86400000) + 1;

    const [result] = await db.execute(
      `INSERT INTO leave_requests
      (employee, type, start_date, end_date, days, status)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [employee, type, start, end, days, "Pending"]
    );

    res.status(201).json({
      success: true,
      message: "Leave request submitted successfully!",
      data: {
        id: result.insertId,
        employee,
        type,
        start,
        end,
        days,
        status: "Pending",
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to submit leave request.",
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const [users] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = users[0];

    if (!user || !(await bcrypt.compare(
      password, user.password_hash
    ))) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed"
    });
  }
});
// Approve or reject a leave request
app.put("/api/leaves/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave status.",
      });
    }

    const [result] = await db.execute(
      `UPDATE leave_requests
       SET status = ?
       WHERE id = ? AND status = 'Pending'`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(409).json({
        success: false,
        message: "Request not found or already processed.",
      });
    }

    res.json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to update leave status.",
    });
  }
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

