require("dotenv").config(); // Load .env file

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const session = require("express-session");

// MySQL Database Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Abel123$",
  database: "gb_traders",
});



// Enable session storage
app.use(session({
  secret: "your_secret_key", // Change this to a secure random string
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.post("/signup", async (req, res) => {
    try {
      const { firstName, lastName, email, password, accountType } = req.body;
  
      console.log("Received Signup Request:", req.body); // Debugging
  
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log("Hashed Password:", hashedPassword); // Debugging
  
      // Insert into MySQL
      const query = `INSERT INTO users (first_name, last_name, email, password, account_type) VALUES (?, ?, ?, ?, ?)`;
      db.query(query, [firstName, lastName, email, hashedPassword, accountType], (err, result) => {
        if (err) {
          console.error("❌ MySQL Insert Error:", err);
          return res.status(500).json({ error: "User already exists or database error" });
        }
        console.log("✅ User Inserted:", result);
        res.json({ message: "✅ Signup successful!", redirect: "updated-html.html" });
      });
  
    } catch (error) {
      console.error("❌ Internal Server Error:", error);
      res.status(500).json({ error: "❌ Internal server error" });
    }
  });
  
// Dealer Login API
app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("🔍 Login Request Received:", email); // Debugging
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
  
      // Check if user exists in MySQL
      const query = `SELECT * FROM users WHERE email = ?`;
      db.query(query, [email], async (err, results) => {
        if (err) {
          console.error("❌ Database Error:", err);
          return res.status(500).json({ error: "Database error" });
        }
  
        if (results.length === 0) {
          console.log("❌ No user found with email:", email); // Debugging
          return res.status(401).json({ error: "Invalid email or password" });
        }
  
        const user = results[0];
        console.log("✅ User Found:", user); // Debugging
  
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log("🔑 Password Match:", passwordMatch); // Debugging
  
        if (!passwordMatch) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
  
        // Store session
        req.session.dealer = {
          id: user.id,
          email: user.email
        };
  
        res.json({ message: "✅ Login successful", redirect: "dealer_frontpage.html" });
      });
    } catch (error) {
      console.error("❌ Internal Server Error:", error);
      res.status(500).json({ error: "❌ Internal server error" });
    }
  });
  

// Logout API
app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "✅ Logged out successfully" });
  });
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL Connection Failed:", err);
    return;
  }
  console.log("✅ Connected to MySQL Database");
});

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Define Vehicle Schema & Model
const VehicleSchema = new mongoose.Schema({
  registration: String,
  miles: Number,
  brand: String,
  model: String,
  images: [String], // Stores images as Base64
});

const Vehicle = mongoose.model("Vehicle", VehicleSchema);

// Multer Storage (Upload to Memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// API to Add a Vehicle Ad (Stores Images in MongoDB)
app.post("/add-vehicle", upload.array("images", 5), async (req, res) => {
  try {
    const { registration, miles, brand, model } = req.body;
    
    // Convert images to Base64
    const imageBase64Array = req.files.map(file => file.buffer.toString("base64"));

    const newVehicle = new Vehicle({ registration, miles, brand, model, images: imageBase64Array });
    await newVehicle.save();

    res.json({ message: "✅ Vehicle added successfully", id: newVehicle._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/vehicles", async (req, res) => {
    try {
      const vehicles = await Vehicle.find().sort({ _id: -1 }).limit(3); // Fetch last 3 vehicles
      res.json(vehicles);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));


  
