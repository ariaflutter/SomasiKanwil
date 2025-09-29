// app.js (VERSI DIPERBAIKI DAN DILANJUTKAN)

const express = require("express");
const session = require("express-session");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const axios = require("axios");
const cron = require("node-cron");
const cheerio = require("cheerio");
const MongoStore = require('connect-mongo');


// Ambil 'io' dari server.js
const { io } = require("./server");

// --- KONFIGURASI DAN MODEL ---
const connectDB = require('./config/db');
const DataModel = require('./models/Data.js'); 
const WajiblaporV2 = require('./models/WajibLapor.js');
const BeholdData = require('./models/beholdData.js');
const BeritaData = require('./models/beritaData.js');
const dashboardRoutes = require('./routes/dashboardRoutes');

// --- RUTE ---
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
// (Kita akan buat ini selanjutnya)
const wajiblaporRoutes = require('./routes/wajiblaporRoutes'); 
const newsRoutes = require('./routes/newsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const { syncDashboard } = require("./services/syncDashboard");



const app = express();
connectDB(); // Jalankan koneksi DB

const corsOptions = {
    // Ganti URL ini jika port frontend Anda berbeda
    origin: 'http://localhost:8080', 
    credentials: true, // Izinkan pengiriman cookie
    optionsSuccessStatus: 200 // Untuk browser lama
  };

  

// --- MIDDLEWARE ---

const prefix = process.env.KODE_BAPAS || "Default";
app.use(cors(corsOptions));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(session({
    secret: process.env.SESSION_SECRET || "gantidenganstringyangsangatacakdanpanjang",
    resave: false,
    saveUninitialized: false,
    KODE_BAPAS: process.env.KODE_BAPAS,
    // Di sinilah keajaibannya terjadi:
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI, // Gunakan koneksi string dari file .env Anda
        collectionName: `${prefix}session`       // Nama koleksi untuk menyimpan data sesi
    }),
    cookie: { 
        maxAge: 1000 * 60 * 60 * 24, // Sesi berlaku selama 24 jam
        httpOnly: true, 
        secure: false // WAJIB false untuk development di localhost (HTTP)
    },
}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/api/config', (req, res) => {
    res.json({
        // Ambil nilai dari process.env dan kirim sebagai JSON
        instanceName: process.env.APP_INSTANCE_NAME || 'Somasi Bapas Jawa Timur' // Beri nilai default jika .env tidak diatur
    });
});


// --- DAFTARKAN SEMUA RUTE ---
app.use('/api/auth', authRoutes);
app.use('/api', clientRoutes);
app.use('/api', wajiblaporRoutes); // Daftarkan rute wajib lapor
app.use('/api', newsRoutes); // Daftarkan rute berita
app.use('/api', chatRoutes); // Daftarkan rute chat
app.use('/api', dashboardRoutes);


// =========================================================================
// SEMUA ENDPOINT DAN LOGIKA BISNIS YANG ADA SEBELUMNYA DI app.js
// SEKARANG SUDAH DIPINDAHKAN KE FILE RUTE MASING-MASING.
// FILE app.js INI SEKARANG BERSIH DAN HANYA BERISI KONFIGURASI.
// =========================================================================

// Jadwalkan sync
cron.schedule("*/30 * * * *", async () => {
    await syncDashboard();
  });

module.exports = app;