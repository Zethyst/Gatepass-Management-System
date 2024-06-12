import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import db from "../connection.js";
import { validateToken } from "../Middlewares/TokenValidation.js";
const con = db;

const router = express.Router();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Applying the rate limiter to all requests
router.use(limiter);

function generateUserId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register route
router.post("/register", async (req, res) => {
  const tableName = "Users";

  const columnsSql =
    "user_id INT PRIMARY KEY, username VARCHAR(30) NOT NULL, password VARCHAR(200) NOT NULL";

  const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;
  try {
    // Create the table if it doesn't exist
    await new Promise((resolve, reject) => {
      con.query(tablesql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Table ${tableName} created or already exists`);
          resolve(result);
        }
      });
    });

    const { username, password } = req.body;
    let secPass = await bcrypt.hash(password, 10);
    const userId = generateUserId();
    // Insert user data into the table
    const sql = `INSERT INTO ${tableName} (user_id, username, password) VALUES (${userId}, ${mysql.escape(
      username
    )}, ${mysql.escape(secPass)})`;
    await new Promise((resolve, reject) => {
      con.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Data inserted into table ${tableName}`);
          resolve(result);
        }
      });
    });

    return res
      .status(200)
      .json({ message: `Data inserted into table ${tableName}` });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Using parameterized queries to prevent SQL injection
  const sql = "SELECT * FROM users WHERE username = ?";

  con.query(sql, [username], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      user: {
        id: user.user_id,
      },
    };
    var privateKey = "valardohaeris";
    var token = jwt.sign(payload, privateKey);

    return res.status(200).json({ message: "Login successful", user, token });
  });
});
// Security Register route
router.post("/securityregister", async (req, res) => {
  const tableName = "Security";

  const columnsSql =
    "user_id INT PRIMARY KEY, username VARCHAR(30) NOT NULL, password VARCHAR(200) NOT NULL";

  const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;
  try {
    // Create the table if it doesn't exist
    await new Promise((resolve, reject) => {
      con.query(tablesql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Table ${tableName} created or already exists`);
          resolve(result);
        }
      });
    });

    const { username, password } = req.body;
    let secPass = await bcrypt.hash(password, 10);
    const userId = generateUserId();
    // Insert user data into the table
    const sql = `INSERT INTO ${tableName} (user_id, username, password) VALUES (${userId}, ${mysql.escape(
      username
    )}, ${mysql.escape(secPass)})`;
    await new Promise((resolve, reject) => {
      con.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Data inserted into table ${tableName}`);
          resolve(result);
        }
      });
    });

    return res
      .status(200)
      .json({ message: `Data inserted into table ${tableName}` });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.post("/securitylogin", async (req, res) => {
  const { username, password } = req.body;

  // Using parameterized queries to prevent SQL injection
  const sql = "SELECT * FROM security WHERE username = ?";

  con.query(sql, [username], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      user: {
        id: user.user_id,
      },
    };
    var privateKey = "valardohaeris";
    var token = jwt.sign(payload, privateKey);

    return res.status(200).json({ message: "Login successful", user, token });
  });
});

router.post("/gatepasses", validateToken, async (req, res) => {
  const tableName = "Gatepasses";
  const gateId = generateUserId();

  const columnsSql =
    "gatepass_id INT PRIMARY KEY AUTO_INCREMENT, type VARCHAR(20) NOT NULL, visitorName VARCHAR(30) NOT NULL, dateOfVisit DATE, purpose VARCHAR(30), designation VARCHAR(30), department VARCHAR(30), materials VARCHAR(100), status VARCHAR(20) DEFAULT 'Pending'";

  const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;

  try {
    await new Promise((resolve, reject) => {
      con.query(tablesql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Table ${tableName} created or already exists`);
          resolve(result);
        }
      });
    });

    const gatepassData = req.body;
    // console.log(req.body);/

    const sql = `INSERT INTO ${tableName} (gatepass_id, type, visitorName, dateOfVisit, purpose, designation, department, materials) VALUES (${gateId}, ${mysql.escape(
      gatepassData.type
    )}, ${mysql.escape(gatepassData.visitorName)}, ${mysql.escape(
      gatepassData.dateOfVisit
    )}, ${mysql.escape(gatepassData.purpose)}, ${mysql.escape(
      gatepassData.designation
    )}, ${mysql.escape(gatepassData.department)}, ${mysql.escape(
      gatepassData.materials
    )})`;
    await new Promise((resolve, reject) => {
      con.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Data inserted into table ${tableName}`);
          resolve(result);
        }
      });
    });
    return res
      .status(200)
      .json({ message: `Data inserted into table ${tableName}` });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.get("/allgatepasses", async (req, res) => {
  const tableName = "Gatepasses";
  const sql = `SELECT * FROM ${tableName}`;
  try {
    con.query(sql, (err, data) => {
      if (err) {
        return res.status(500).json({ message: err.sqlMessage });
      }
      return res.status(200).json(data);
    });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.post('/approve', async (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE gatepasses SET status='Approved' WHERE gatepass_id = ${mysql.escape(id)}`;

  con.query(sql, (error, result) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }
    return res.json({ message: `Row in table gatepasses updated to Approved` });
  });
});

router.post('/reject', async (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE gatepasses SET status='Rejected' WHERE gatepass_id = ${mysql.escape(id)}`;

  con.query(sql, (error, result) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }
    return res.json({ message: `Row in table gatepasses updated to Rejected` });
  });
});


export default router;
