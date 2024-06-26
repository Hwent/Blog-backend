const express = require("express");
const passport = require("passport");
const cors = require("cors");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const User = require("./models/User");

// Connect to MongoDB
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI);

require("./config/passport")(passport);
const helper = require("./lib/helper");

const app = express();
app.use(cors());
// This will initialize the passport object on every request
app.use(passport.initialize());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post("/signup", (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (user) {
      return res
        .status(401)
        .json({ success: false, message: "username already taken" });
    }
  });
  const { salt, hash } = helper.genPassword(req.body.password);
  const user = new User({
    username: req.body.username,
    hash: hash,
    salt: salt,
  });
  user
    .save()
    .then((user) => {
      const jwt = helper.issueJWT(user);
      res.json({
        success: true,
        user: user,
        message: "user created",
        token: jwt.token,
        expiresIn: jwt.expires,
      });
    })
    .catch((err) => next(err));
});

app.post("/login", (req, res) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "could not find user" });
    }

    const isValid = helper.validPassword(
      req.body.password,
      user.hash,
      user.salt
    );

    if (isValid) {
      const jwt = helper.issueJWT(user);

      res.status(200).json({
        success: true,
        user: user,
        message: "user found & logged in",
        token: jwt.token,
        expiresIn: jwt.expires,
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "you entered the wrong password" });
    }
  });
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

app.get("/blog", async (req, res) => {
  const posts = await Post.find({}).populate("author");
  res.json(posts);
});

app.post("/blog", async (req, res) => {
  const post = new Post(req.body);
  await post.save();
  res.json(post);
});

app.get("/blog/:id", async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.json(post);
});

app.put("/blog/:id", async (req, res) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(post);
});

app.delete("/blog/:id", async (req, res) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  res.json(post);
});

app.get("/blog/:postId/comments", async (req, res) => {
  const post = await Post.findById(req.params.postId).populate("comments");
  res.json(post.comments);
});

app.post("/blog/:postId/comments", async (req, res) => {
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
