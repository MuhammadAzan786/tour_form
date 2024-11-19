require("dotenv").config();
const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/virtualTourDB")
  .then(() => {
    console.log("database connected");
  })
  .catch((error) => {
    console.log("not connected to database");
  });

// Set up Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mongoose schema
const propertySchema = new mongoose.Schema({
  rooms: Number,
  bathrooms: Number,
  area: String,
  address: String,
  images: [{ name: String, url: String }],
  hotspots: [{ pitch: Number, yaw: Number, name: String, linkedImage: String }],
});

const Property = mongoose.model("Property", propertySchema);

const hotspotSchema = new mongoose.Schema({
  pitch: Number,
  yaw: Number,
  text: String,
  image: String, // To associate the hotspot with a specific image
});

const Hotspot = mongoose.model("Hotspot", hotspotSchema);

app.post("/api/hotspots", async (req, res) => {
  try {
    const { pitch, yaw, text, image } = req.body;
    const hotspot = new Hotspot({ pitch, yaw, text, image });
    await hotspot.save();
    res.status(201).json({ message: "Hotspot saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving hotspot", error });
  }
});

app.get("/api/hotspots/:image", async (req, res) => {
  try {
    const hotspots = await Hotspot.find({ image: req.params.image });
    res.status(200).json(hotspots);
  } catch (error) {
    res.status(500).json({ message: "Error fetching hotspots", error });
  }
});

// Image upload route
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    const result = await cloudinary.uploader.upload_stream(
      { folder: "virtual_tour_images" },
      (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(200).json({ url: result.secure_url });
      }
    );
    if (file) {
      const stream = result;
      stream.end(file.buffer);
    } else {
      res.status(400).send("No file uploaded");
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to save property data
app.post("/property", async (req, res) => {
  const newProperty = new Property(req.body);
  try {
    const savedProperty = await newProperty.save();
    res.status(200).json(savedProperty);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the server
app.listen(5000, () => {
  console.log("Server is running on http://localhost:5000");
});
