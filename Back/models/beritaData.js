const mongoose = require("mongoose");
const prefix = process.env.KODE_BAPAS || "Default";

const BeritaData = new mongoose.Schema(
  {
    title: String,
    link: String,
    image: String,
    author: String,
    date: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
  },
  { collection: `${prefix}BeritaData` }
);

module.exports = mongoose.model(`${prefix}BeritaData`, BeritaData);