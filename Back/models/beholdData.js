const mongoose = require("mongoose");
const prefix = process.env.KODE_BAPAS || "Default";

const BeholdData = new mongoose.Schema({
    postId: { type: String, required: true, unique: true }, // Unique identifier for each post
    timestamp: { type: String, required: true }, // Timestamp of the post
    permalink: { type: String, required: true }, // URL to the post
    mediaType: { type: String, required: true }, // Type of media (e.g., 'IMAGE', 'VIDEO')
    mediaUrl: { type: String, required: true }, // URL to the media (image/video)
    caption: { type: String }, // Caption of the post
    prunedCaption: { type: String }, // Pruned version of the caption (if applicable)
    hashtags: [String], // List of hashtags used in the post
    mentions: [String], // List of mentions in the post
    colorPalette: [Object], // Color palette extracted from the media (if available)
  },
  { collection: `${prefix}BeholdData` },
  { 
    timestamps: true });

module.exports = mongoose.model(`${prefix}BeholdData`, BeholdData);
