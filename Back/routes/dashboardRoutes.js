// routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { getDashboardData, getPerkembanganData, syncDashboard } = require('../services/syncDashboard');
const WajiblaporV2 = require('../models/WajibLapor.js'); // Pastikan path ini benar

// Endpoint gabungan untuk semua data dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Jalankan sync jika data dari service belum tersedia (misalnya saat server baru start)
    if (!getDashboardData() || !getPerkembanganData()) {
      await syncDashboard();
    }

    // Tentukan rentang tanggal: 30 hari terakhir dari sekarang
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // Jalankan semua kueri secara paralel untuk efisiensi maksimal
    const [
        summary,
        perkembangan,
        aktivitasTerakhir,
        laporanHarian // <-- Data baru untuk grafik wajib lapor harian
    ] = await Promise.all([
        getDashboardData(), // Ambil data ringkasan dari cache/service
        getPerkembanganData(), // Ambil data perkembangan dari cache/service
        
        // Kueri untuk widget "Aktivitas Terbaru" (10 data terakhir)
        WajiblaporV2.find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .lean(),
        
        // Kueri Agregasi untuk grafik "Wajib Lapor Harian" (30 hari terakhir)
        WajiblaporV2.aggregate([
          // Tahap 1: Filter dokumen hanya dalam 30 hari terakhir
          { 
            $match: { timestamp: { $gte: thirtyDaysAgo } } 
          },
          // Tahap 2: Buat field 'tanggal' dari 'timestamp' dengan format YYYY-MM-DD
          { 
            $project: {
              tanggal: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
            }
          },
          // Tahap 3: Kelompokkan berdasarkan 'tanggal' dan hitung jumlahnya
          { 
            $group: {
              _id: "$tanggal",    // Jadikan tanggal sebagai ID grup
              jumlah: { $sum: 1 } // Hitung (sum) setiap dokumen dalam grup
            }
          },
          // Tahap 4: Urutkan hasilnya berdasarkan tanggal (ID grup)
          { 
            $sort: { _id: 1 } // 1 untuk ascending (dari terlama ke terbaru)
          }
        ])
    ]);

    // Validasi data utama
    if (!summary || !perkembangan) {
      return res.status(404).json({ message: 'Dashboard data not available after sync' });
    }

    // Kirim semua data yang dibutuhkan frontend dalam satu respons JSON
    res.json({
      summary,
      perkembangan,
      aktivitasTerakhir,
      laporanHarian // <-- Sertakan data baru ini
    });

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;