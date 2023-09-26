const express = require("express");
const mongoose = require("mongoose");
const routes = require("./routes/index");
const viewRoutes = require("./views/index");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use("/api", routes);
app.set("view engine", "ejs");
app.use("/", viewRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
