// importUsers.js
require('dotenv').config(); // Untuk membaca MONGO_URI dari .env
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Sesuaikan path jika perlu

// --- ISI DAFTAR NAMA PEGAWAI ANDA DI SINI ---
const dataPegawai = [
    { namaLengkap: "Kakanwil", username: "Kakanwil", status: "Aktif" },
   
];

const importUsers = async () => {
    console.log("--- Memulai skrip impor user (dengan hashing manual) ---");
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
        console.error("❌ KESALAHAN: MONGO_URI tidak ditemukan di .env.");
        return;
    }

    try {
        await mongoose.connect(mongoUri);
        console.log("✅ Berhasil terhubung ke MongoDB.");

        const pegawaiAktif = dataPegawai.filter(p => p.status === 'Aktif');
        console.log(`Mempersiapkan untuk mengimpor ${pegawaiAktif.length} pegawai aktif...`);

        // --- 2. PERUBAHAN UTAMA DI SINI ---
        const usersToCreate = [];
        for (const pegawai of pegawaiAktif) {
            // Hash password default secara manual
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password', salt);

            usersToCreate.push({
                username: pegawai.username,
                namaLengkap: pegawai.namaLengkap,
                password: hashedPassword, // <-- Gunakan password yang sudah di-hash
                role: 'Petugas',
            });
        }

        console.log("Memasukkan user ke database...");
        const result = await User.insertMany(usersToCreate, { ordered: false });
        console.log(`✅ BERHASIL! ${result.length} user baru berhasil dimasukkan.`);

    } catch (error) {
        // ... (kode error handling tetap sama) ...
        if (error.code === 11000) {
            console.warn("⚠️ PERINGATAN: Sebagian/semua user sudah ada.");
        } else {
            console.error("❌ KESALAHAN KRITIS:", error);
        }
    } finally {
        await mongoose.connection.close();
        console.log("🔌 Koneksi ke MongoDB ditutup.");
    }
};

importUsers();