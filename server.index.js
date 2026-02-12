const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Verify environment variable
if (!process.env.MONGO_DB) {
  console.error('MONGO_DB environment variable is not set!');
  process.exit(1);
}

console.log('MongoDB URI exists:', !!process.env.MONGO_DB);

// ===== MongoDB Connection with proper options =====
mongoose.connect(process.env.MONGO_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
})
.catch(err => console.error('Initial connection error:', err));

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// ===== User Schema =====
const userSchema = new mongoose.Schema({
   fullName: String,
  email: String,
  phNum: String,
  dob: String,
  address: String,
  city: String,
  pincode: String,
  selectBranch: String,
  membershipPlan: String
});

const User = mongoose.model("User", userSchema);

// Book Slot Schema
const bookSlotSchema = new mongoose.Schema({
  bookby: String,
  sportName: String,
  branch: String,
  fullName: String,
  phNum: String,
  addFriend: [Object],
  date: String,
  duration: String,
  timeSlot: String,
  type: { type: String, enum: ["private", "community"] },
  totalPlayer: Number,
  amount: Number
});

const BookSlot = mongoose.model("BookSlot", bookSlotSchema);

// Community Schema
const communitySchema = new mongoose.Schema({
  sport: String,
  facility: String,
  date: String,
  time: String,
  requiredPlayer: Number,
  instantJoin: Boolean
});

const Community = mongoose.model("Community", communitySchema);

// Admin - Add Sport Schema
const sportSchema = new mongoose.Schema({
  sportName: String,
  categoryType: String,
  description: String,
  status: String
});

const Sport = mongoose.model("Sport", sportSchema);

// ===== Register API =====
app.post("/user/register", async (req, res) => {
  try {
    const { fullName, phNum } = req.body;

    if (!phNum) {
      return res.status(400).json({ message: "Please enter the valid number" });
    }
    // check user exists
    const existingUser = await User.findOne({ phNum });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // save user
    const newUser = new User({
      fullName,
      phNum,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully", data: newUser });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// ===== Login API =====
app.post("/user/login", async (req, res) => {
  try {
    const { phNum } = req.body;

    // check user
    const user = await User.findOne({ phNum });
    if (!user) {
      return res.status(400).json({ message: "Invalid Number" });
    }

    // create token
    return res.status(200).json({
      message: "Login successful",
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/user/add", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: "User added successfully", data: user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Users
app.get("/user", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST Book Slot
app.post("/booking", async (req, res) => {
  try {
    const slot = new BookSlot(req.body);
    await slot.save();
    res.json({ message: "Slot booked successfully", data: slot });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Book Slots
app.get("/booking", async (req, res) => {
  try {
    const slots = await BookSlot.find();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/* ---- Community ---- */

// POST Create Community
app.post("/community", async (req, res) => {
  try {
    const community = new Community(req.body);
    await community.save();
    res.json({ message: "Community created successfully", data: community });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Communities
app.get("/community", async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// POST Add Sport
app.post("/sport", async (req, res) => {
  try {
    const sport = new Sport(req.body);
    await sport.save();
    res.json({ message: "Sport added successfully", data: sport });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET Sports
app.get("/sport", async (req, res) => {
  try {
    const sports = await Sport.find();
    res.json(sports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== Start Server =====
app.listen(5000, () => {
  console.log("Server running on port 5000");
});


