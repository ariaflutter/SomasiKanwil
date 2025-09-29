// routes/wajiblaporRoutes.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const WajiblaporV2 = require('../models/WajibLapor.js');

// Konfigurasi Multer untuk upload foto wajib lapor
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const { RegisterUtama } = req.body;
        if (!RegisterUtama) {
            return cb(new Error("RegisterUtama is required to create a folder"), false);
        }
        const uploadDir = path.join(__dirname, '..', 'uploads', RegisterUtama);
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
        const filename = `${date}-${time}${path.extname(file.originalname)}`;
        cb(null, filename);
    },
});

const upload = multer({ storage });


// Endpoint untuk submit wajib lapor
router.post("/wajiblapor", upload.single("photo"), async (req, res) => {
    const { RegisterUtama, Nama, Alamat, Katagori, Pasal, NamaPK, TanggalHariIni, latitude, longitude } = req.body;
    if (!req.file) {
        return res.status(400).json({ message: "Foto dibutuhkan untuk Wajib Lapor" });
    }
    
    // Path yang disimpan di DB harus relatif agar bisa diakses dari frontend
    const photoPath = `/uploads/${RegisterUtama}/${req.file.filename}`;

    try {
        const newEntry = new WajiblaporV2({
            RegisterUtama, Nama, Alamat, Katagori, Pasal, NamaPK, TanggalHariIni, latitude, longitude, photoPath
        });
        await newEntry.save();
        const io = req.app.get('io');
        io.emit('laporan_baru', newEntry);
        console.log('Notifikasi Wajib Lapor baru telah di-emit via Socket.IO'); // Log untuk debugging
        res.status(201).json({ message: "Terima Kasih Anda Sudah Wajib Lapor" });
    } catch (error) {
        console.error("Error saving entry:", error);
        res.status(500).json({ message: "Failed to save entry", error });
    }
});

// Endpoint untuk mengambil semua gambar milik seorang klien
router.get("/images/:registerUtama", (req, res) => {
    const { registerUtama } = req.params;
    const userImagesDir = path.join(__dirname, '..', 'uploads', registerUtama);
    fs.readdir(userImagesDir, (err, files) => {
        if (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'No images found for this user.' });
            }
            return res.status(500).json({ error: "Failed to fetch images" });
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(imageFiles);
    });
});

// Endpoint untuk mengambil semua data wajib lapor
router.get("/wajib-lapor", async (req, res) => {
    try {
        const data = await WajiblaporV2.find({}).sort({ timestamp: -1 });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Endpoint untuk mencari wajib lapor berdasarkan tanggal
router.get("/search-wajib-lapor-by-date", async (req, res) => {
    const { date } = req.query;
    if (!date) {
        return res.status(400).json({ error: "Date query parameter is required" });
    }

    try {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const results = await WajiblaporV2.find({
            timestamp: { $gte: startDate, $lte: endDate },
        });
        res.json(results);
    } catch (error) {
        console.error("Error fetching data by date:", error);
        res.status(500).json({ error: "An error occurred while searching for data" });
    }
});

router.get("/search-wajib-lapor", async (req, res) => {
    const { nama } = req.query;
    if (!nama) {
        return res.status(400).json({ message: "Parameter 'nama' dibutuhkan" });
    }
    try {
        // --- PERBAIKAN: Gunakan nama variabel model yang konsisten ---
        const results = await WajiblaporV2.find({ Nama: nama }).sort({ timestamp: -1 });
        res.json(results);
    } catch (error) {
        // Log error yang lebih detail di konsol backend
        console.error("CRITICAL ERROR in /search-wajib-lapor:", error); 
        res.status(500).json({ message: "Internal server error" });
    }
});

router.put("/update-wajiblapor", async (req, res) => {
    const { nama, status } = req.body;
    try {
        const result = await DataModel.updateOne({ Nama: nama }, { $set: { WajibLapor: status } });
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json({ message: "WajibLapor status updated successfully" });
    } catch (error) {
        console.error("Error updating WajibLapor:", error);
        res.status(500).json({ message: "Failed to update WajibLapor status" });
    }
});

router.get("/search-wajib-lapor", async (req, res) => {
    const { nama } = req.query;
    if (!nama) {
        return res.status(400).json({ message: "Parameter 'nama' dibutuhkan" });
    }
    try {
        // Cari semua entri yang cocok dengan nama, urutkan dari yang terbaru
        const results = await WajiblaporV2.find({ Nama: nama }).sort({ timestamp: -1 });
        res.json(results);
    } catch (error) {
        console.error("Error fetching wajib lapor by name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;