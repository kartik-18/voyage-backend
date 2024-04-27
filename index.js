const express = require("express");
const mongoose = require("mongoose");
const Blog = require("./Blog"); // Import the Blog model
const fileupload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;

const app = express();
var cors = require("cors");
app.use(cors());

cloudinary.config({
  // cloud_name : process.env.CLOUD_NAME
  cloud_name: "flyhigh",
  api_key: "349654452471974",
  api_secret: "uCYRwAMry0eKYcVZZXd3Ge0jgMY",
});
app.set("view engine", "ejs");

mongoose
  .connect("mongodb+srv://Kartik1702:kartik9579@cluster0.inbwdc6.mongodb.net/blogs?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Route to add a new blog
app.post("/blogs", async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file;
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "users",
    });

    const { title, description } = req.body;
    const blog = new Blog({ title, description, imageUrl: result.secure_url });
    await blog.save();
    res.status(201).json(blog);
  } catch (err) {
    console.error("Error creating blog:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to delete a blog
app.delete("/blogs/:id", async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err) {
    console.error("Error deleting blog:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get all blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.json(blogs);
  } catch (err) {
    console.error("Error getting blogs:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Route to get a single blog by ID
app.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.log(blog);
      return res.status(404).json({ error: "Blog not found" });
    }
    res.json(blog);
  } catch (err) {
    console.error("Error getting blog:", err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
