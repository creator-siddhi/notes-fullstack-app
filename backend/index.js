require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/user_model");
const Note = require("./models/note_model"); // Fixed typo from node_model
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/notes-app')
  .then(() => console.log('Connected to MongoDB!'))
  .catch((err) => console.error('Could not connect to MongoDB', err));

app.use(express.json());
app.use(cors({ origin: "*" }));

const secret = process.env.ACCESS_TOKEN_SECRET; 
if (!secret) {
    console.error("ERROR: ACCESS_TOKEN_SECRET is missing in .env file");
}

app.get("/", (req, res) => {
    res.json({ data: "hello" });
});

// --- CREATE ACCOUNT ---
app.post("/create-account", async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.status(400).json({ error: true, message: "User already exists" });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    // Standardize payload: { user }
    const accessToken = jwt.sign(
        { user }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: "3600m" }
    );

    return res.json({
        error: false,
        user: { fullName: user.fullName, email: user.email, _id: user._id },
        accessToken,
        message: "Registration Successful",
    });
});

// --- LOGIN ---
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    const userInfo = await User.findOne({ email });
    if (!userInfo) {
        return res.status(400).json({ message: "User not found" });
    }

    // In a real app, use bcrypt.compare(password, userInfo.password)
    if (userInfo.email === email && userInfo.password === password) {
        const accessToken = jwt.sign(
            { user: userInfo }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: "3600m" }
        );

        return res.json({
            error: false,
            message: "Login Successful",
            email,
            accessToken,
        });
    } else {
        return res.status(400).json({
            error: true,
            message: "Invalid Credentials",
        });
    }
});
//Get User
app.get("/get-user",authenticateToken, async(req,res)=>{
   const {user}=req.user;
   const isUser=await User.findOne({_id:user._id});
   if(!isUser){
    return res.sendStatus(401);
   }
   return res.json({
    user:{
        fullName:isUser.fullName, 
        email:isUser.email,
        "_id":user._id,
        createdOn:user.createdOn,
    },
    message:"",
   });
})

// --- ADD NOTE ---
app.post("/add-note", authenticateToken, async (req, res) => {
    const { title, content, tags } = req.body;
    // req.user comes from your authenticateToken middleware
    const { user } = req.user; 

    if (!title || !content) {
        return res.status(400).json({ error: true, message: "Title and Content are required" });
    }

    try {
        // Inside index.js -> app.post("/add-note", ...)
        const note = new Note({
            title,
            content,
            tags: tags || [],
            isPinned: false, // Manually add this line
            userId: user._id,
});

        await note.save();
        return res.json({
            error: false,
            note,
            message: "Note added successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
//edit note
app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    // Check if at least one field is provided for update
    if (!title && !content && !tags && isPinned === undefined) {
        return res.status(400).json({ error: true, message: "No changes provided!" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        
        // Correct way to check for boolean updates
        if (isPinned !== undefined) note.isPinned = isPinned;

        await note.save();
        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});
//Get All notes
app.get("/get-all-notes/",authenticateToken,async(req,res)=>{
    const {user}=req.user;
    try{
        const notes=await Note.find({userId:user._id}).sort({isPinned:-1});

        return res.json({
            error:false,
            notes,
            message:"All notes retrieved successfully",
        });
    }catch(error){
        return res.status(500).json({
            error:true,
            message:"Internal Server error",
        });
    }
});
//Delete Note
app.delete("/delete-note/:noteId",authenticateToken,async(req,res)=>{
    const noteId=req.params.noteId;
    const {user}=req.user;
    try{
        const note=await Note.findOne({_id:noteId,userId:user._id});
        if(!note){
            return res.status(404).json({error:true,message:"Note not found"});
        }
        await Note.deleteOne({_id:noteId,userId:user._id});
        return res.json({
            error:false,
            message:"Note deleted successfully!"
        });

    }
    catch (error){
        return res.status(500).json({
            error:true,
            message:"Internal server error",
        });
    }
});
//update ispinned value
app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
    const noteId = req.params.noteId;
    const { isPinned } = req.body;
    const { user } = req.user;

    // Fix: specifically check for undefined
    if (isPinned === undefined) {
        return res.status(400).json({ error: true, message: "isPinned value is required!" });
    }

    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }
        
        note.isPinned = isPinned;

        await note.save();
        return res.json({
            error: false,
            note,
            message: "Note pin status updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal server error",
        });
    }
});


// Search Notes
app.get("/search-notes/", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;

  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Search query is required" });
  }

  
  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  }  
   catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
});
app.listen(8000, () => console.log("Server running on port 8000"));

module.exports = app;