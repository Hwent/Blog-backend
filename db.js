const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
