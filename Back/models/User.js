// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const prefix = process.env.KODE_BAPAS || "Default";

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    namaLengkap: {type:String, required: true},
    role: { type: String, enum: ["Supervisor", "Petugas", "Klien"], default: "Petugas" },
}, { collection: `${prefix}User` });

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model(`${prefix}User`, UserSchema);