const mongoose = require("mongoose");
const prefix = process.env.KODE_BAPAS || "Default";

const WajiblaporSchema = new mongoose.Schema({
    RegisterUtama: {type: String, required: true, index:true},
    Nama: {type: String, required: true, index:true},
    Alamat: String,
    Katagori: String,
    Pasal: String,
    NamaPK: String,
    TanggalHariIni: String,
    latitude: String,
    longitude: String,
    photoPath: String, // Store the photo as a Base64 string or link to a storage location
    timestamp: { type: Date, default: Date.now },
},
{ collection: `${prefix}WajibLapor` }
);

module.exports = mongoose.model( `${prefix}WajibLapor`, WajiblaporSchema,);
