const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const validUrl = require("valid-url");

const app = express();

app.use(express.json({ extended: false }));

// db connetions
mongoose
  .connect(
    process.env.DB_URL
  )
  .then(() => console.log("connected to db"))
  .catch((err) => console.log(err.message));

// mongoose model

const urlSchema = mongoose.Schema(
  {
    longUrl: {
      type: String,
      required: true,
    },
    shortId: {
      type: String,
      required: true,
      default: shortid.generate,
    },
  },
  { timestamp: true }
);

const Url = mongoose.model("url", urlSchema);

app.get("/:shortId", async (req, res) => {
  const url = await Url.findOne({ shortId: req.params.shortId });

  if (url) return res.redirect(url.longUrl);
  else return res.status(404).json("url not found");
});

app.post("/", async (req, res) => {
  const { longUrl } = req.body;

  //   checking if url is valid dor not
  if (!validUrl.isUri(longUrl)) return res.status(401).json("invalid url");

  //   checking if url already exist in db
  const url = await Url.findOne({ longUrl });
  if (url) return res.json(url.shortId);

  const newUrl = Url({ longUrl });

  const data = await newUrl.save();

  return res.json(data.shortId);
});

app.listen(8000, () => console.log("server running .."));
