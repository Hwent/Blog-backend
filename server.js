const express = require("express");

const Post = require("./models/Post");
const Comment = require("./models/Comment");
const User = require("./models/User");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Connect to MongoDB
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);

app.get("/", async (req, res) => {
  const posts = await Post.find({});
  const comments = await Comment.find({});
  const users = await User.find({});

  res.json({ posts, comments, users });
});

//clear db : dev only
app.delete("/", async (req, res) => {
  await Post.deleteMany({});
  await Comment.deleteMany({});
  await User.deleteMany({});

  res.json({ message: "cleared" });
});

app.get("/users", async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

app.post("/signup", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.json(user);
  } else {
    res.json({ message: "Invalid username or password" });
  }
});

app.get("/users/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  res.json(user);
});

app.put("/users/:id", async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(user);
});

app.delete("/users/:id", async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  res.json(user);
});

app.get("/posts", async (req, res) => {
  const posts = await Post.find({});
  res.json(posts);
});

app.post("/posts", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

app.get("/posts/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

app.put("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(post);
});

app.delete("/posts/:id", async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  res.json(post);
});

app.get("/posts/:postId/comments", async (req, res) => {
  const post = await Post.findById(req.params.postId).populate("comments");
  res.json(post.comments);
});

app.post("/posts/:postId/comments", async (req, res) => {
  const post = await Post.findById(req.params.postId);
  const comment = new Comment(req.body);
  post.comments.push(comment);
  await comment.save();
  await post.save();
  res.json(comment);
});

app.get("/comments", async (req, res) => {
  const comments = await Comment.find({});
  res.json(comments);
});

app.get("/comments/:id", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  res.json(comment);
});

app.put("/comments/:id", async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(comment);
});

app.listen(3000, () => console.log("Server started on port 3000"));
