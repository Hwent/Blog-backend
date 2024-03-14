const express = require("express");
const app = express();
const Post = require("./models/Post");
app.get("/", (req, res) => {
  res.direct("/posts");
});

app.get("/posts", async (req, res) => {
  await Post.find({}, (err, posts) => {
    if (err) {
      res.send(err);
    }
    res.json({ posts });
  });
});

app.listen(3000, () => console.log("Server started on port 3000"));
