// routes/clientRoutes.js

const express = require('express');
const router = express.Router();

// Impor model Data.js
const DataModel = require('../models/Data.js');

// Upload Excel Endpoint

const isAuthenticated = (req, res, next) => {

     console.log(`\n[PEMERIKSAAN OTENTIKASI]`);
    console.log(`>>> Cookie yang diterima dari browser:`, req.headers.cookie);
    console.log(`>>> ID Sesi setelah di-parse oleh Express: ${req.session.id}`);
    console.log(`>>> Isi Sesi Lengkap saat diperiksa:`, req.session);
    if (req.session.userId) {
        // Jika punya tiket, izinkan masuk ke proses selanjutnya.
        return next();
    }
    // Jika tidak punya tiket, tolak dengan sopan.
    res.status(401).json({ message: 'Akses ditolak. Anda harus login.' });
};

/**
 * @route   GET /api/clients/my-clients
 * @desc    Mengambil daftar klien HANYA milik user yang sedang login.
 * @access  Private (hanya untuk yang sudah login)
 */
router.get('/my-clients', isAuthenticated, async (req, res) => {
    try {
        // Perintah ke database:
        // "Tolong carikan semua klien yang kolom 'userId'-nya sama dengan
        // ID user yang tersimpan di sesi login ini."
        const clients = await DataModel.find({ userId: req.session.userId });
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error saat mengambil data klien saya:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server' });
    }
});

// Search endpoint
router.get("/search", async (req, res) => {
    const { nama, exact } = req.query;
    if (!nama) {
        return res.status(400).json({ message: "Nama parameter is required" });
    }
    try {
        const searchQuery = exact === "true" ? { Nama: nama } : { Nama: { $regex: nama, $options: "i" } };
        const results = await DataModel.find(searchQuery);
        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get user by ID endpoint
router.get("/user/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const user = await DataModel.findById(id);
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        res.send(user);
    } catch (error) {
        res.status(500).send({ message: "Server error" });
    }
});

// Get unique NamaPK endpoint
router.get("/unique-namapk", async (req, res) => {
    try {
        const uniqueNames = await DataModel.distinct("NamaPK");
        res.json(uniqueNames);
    } catch (error) {
        res.status(500).json({ error: "Error fetching unique names" });
    }
});

// Search by NamaPK endpoint
router.get("/search-namapk", async (req, res) => {
    try {
        const { namaPK } = req.query;
        if (!namaPK) {
            return res.status(400).json({ message: "Please provide a NamaPK to search" });
        }
        const results = await DataModel.find({ NamaPK: namaPK });
        res.json(results);
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).json({ message: "Error fetching data from database" });
    }
});

// Update WajibLapor status endpoint
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

router.put("/update-wajiblapor/:id", isAuthenticated, async (req, res) => {
    // Ambil ID dari parameter URL, bukan dari body
    const { id } = req.params; 
    // Ambil status baru dari body
    const { status } = req.body;

    // Validasi input
    if (!status || (status !== 'Ya' && status !== 'Tidak')) {
        return res.status(400).json({ message: "Status harus 'Ya' atau 'Tidak'" });
    }

    try {
        // Gunakan findByIdAndUpdate untuk mencari dan mengupdate berdasarkan _id
        const updatedClient = await DataModel.findByIdAndUpdate(
            id, 
            { $set: { WajibLapor: status } },
            { new: true } // Opsi ini agar Mongoose mengembalikan dokumen yang sudah diupdate
        );

        if (!updatedClient) {
            return res.status(404).json({ message: "Data klien tidak ditemukan" });
        }

        res.status(200).json({ message: "Status Wajib Lapor berhasil diperbarui", client: updatedClient });

    } catch (error) {
        console.error("Error updating WajibLapor:", error);
        res.status(500).json({ message: "Gagal memperbarui status Wajib Lapor" });
    }
});


module.exports = router;