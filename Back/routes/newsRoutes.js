// routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const cron = require('node-cron');

// Impor model
const BeholdData = require('../models/beholdData.js');
const BeritaData = require('../models/beritaData.js');


// Impor layanan
const { fetchBeholdData } = require('../services/beholdService.js');
const { refreshdatakompasiana } = require('../services/kompasianaService.js');

// --- ENDPOINTS ---

router.get("/refresh-behold", async (req, res) => {
    try {
        await fetchBeholdData();
        res.status(200).json({ message: "Data Behold Telah di Refresh" });
    } catch (error) {
        res.status(500).json({ message: "Error refreshing Behold data.", error: error.message });
    }
});

router.get("/behold-data", async (req, res) => {
    try {
        const data = await BeholdData.find().sort({ timestamp: -1 });
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found." });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving data.", error: error.message });
    }
});

router.get("/refresh-kompasiana", async (req, res) => {
    try {
        await refreshdatakompasiana();
        res.status(200).json({ message: "Data Kompasiana refreshed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error refreshing Kompasiana data.", error: error.message });
    }
});

router.get("/berita-data", async (req, res) => {
    try {
        const data = await BeritaData.find().sort({ timestamp: -1 }); // Mengurutkan dari yang terbaru
        if (!data || data.length === 0) {
            return res.status(404).json({ message: "No data found." });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving data.", error: error.message });
    }
});

// --- CRON JOB ---
// Tugas terjadwal akan dijalankan di sini saat file ini dimuat
cron.schedule(
    "0 8 * * *", // Setiap hari jam 8 pagi
    async () => {
        console.log("Running scheduled task: Refreshing external data...");
        try {
            await fetchBeholdData();
            await refreshdatakompasiana();
            console.log("Scheduled task completed successfully.");
        } catch (error) {
            console.error("Error during scheduled task:", error);
        }
    },
    {
        scheduled: true,
        timezone: "Asia/Jakarta",
    }
);

module.exports = router;