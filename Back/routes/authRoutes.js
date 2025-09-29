// routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Impor model User dari folder models
const User = require('../models/User.js');

const isAuth = (req, res, next) => {
  // Cek apakah ada sesi dan ada userId di dalam sesi
  if (req.session && req.session.userId) {
      // Jika ya, pengguna terautentikasi. Lanjutkan ke fungsi selanjutnya (handler rute).
      return next();
  }
  // Jika tidak, kirim response 'Unauthorized'
  return res.status(401).json({ message: 'Akses ditolak. Silakan login terlebih dahulu.' });
};

/**
 * @route   POST /api/auth/register
 * @desc    Mendaftarkan user baru (PENTING: untuk membuat user pertama kali)
 * @access  Public
 */
router.post('/register', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username dan password dibutuhkan' });
    }

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: 'Username sudah digunakan' });
        }

        // Password akan di-hash secara otomatis oleh hook 'pre-save' di model User.js
        const newUser = new User({ username, password, role });
        await newUser.save();

        res.status(201).json({ message: 'User berhasil dibuat. Silakan login.' });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan pada server saat registrasi' });
    }
});


/**
 * @route   POST /api/auth/login
 * @desc    Login user menggunakan data dari database
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // Buat session
    req.session.userId = user._id; // Simpan ID user, lebih baik daripada username
    req.session.username = user.username;
    req.session.role = user.role;
    console.log(`\n[LOGIN SUKSES]`);
    console.log(`>>> Sesi DIBUAT dengan ID: ${req.session.id}`);
    console.log(`>>> Isi Sesi Lengkap:`, req.session);
    
    res.status(200).json({ message: 'Login berhasil', role: user.role });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan pada server' });
  }
});

/**
 * @route   GET /api/auth/session
 * @desc    Mengecek sesi login yang aktif
 * @access  Private
 */
router.get('/session', (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({
      loggedIn: true,
      username: req.session.username,
      role: req.session.role,
    });
  } else {
    return res.status(401).json({ loggedIn: false });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user dan menghancurkan sesi
 * @access  Private
 */
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Gagal untuk logout' });
    }
    res.clearCookie('connect.sid'); 
    res.status(200).json({ message: 'Logout berhasil' });
  });
});


// Tambahkan ini di dalam routes/authRoutes.js
router.get('/debug-session', (req, res) => {
  console.log('--- MATA-MATA SESI AKTIF ---');
  console.log('Isi req.session saat ini:', req.session);
  console.log('---------------------------');
  
  if (req.session && req.session.userId) {
    res.status(200).json({ 
        status: 'SUKSES', 
        message: 'Sesi ditemukan dan valid.', 
        sessionData: req.session 
    });
  } else {
    res.status(401).json({ 
        status: 'GAGAL', 
        message: 'Sesi TIDAK ditemukan di server.' 
    });
  }
});


// ==========================================================
// ENDPOINT BARU UNTUK GANTI KATA SANDI
// ==========================================================
/**
 * @route   POST /api/auth/change-password
 * @desc    Mengubah kata sandi pengguna yang sedang login (berbasis sesi)
 * @access  Private (membutuhkan sesi aktif)
 */
router.post('/change-password', isAuth, async (req, res) => {
  // `isAuth` adalah middleware yang memastikan pengguna sudah login via sesi

  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.session.userId; // <<< Ambil ID pengguna dari sesi

  // 1. Validasi Input Dasar
  if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Mohon isi semua field yang diperlukan.' });
  }

  if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi kata sandi baru tidak cocok.' });
  }

  // Contoh validasi kekuatan kata sandi
  if (newPassword.length < 8) {
      return res.status(400).json({ message: 'Kata sandi baru minimal harus 8 karakter.' });
  }

  try {
      // 2. Cari Pengguna di Database
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
      }

      // 3. Verifikasi Kata Sandi Saat Ini
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Kata sandi saat ini salah.' });
      }
      
      if (currentPassword === newPassword) {
          return res.status(400).json({ message: 'Kata sandi baru tidak boleh sama dengan kata sandi lama.' });
      }

      // 4. Hash Kata Sandi Baru
      // Jika Anda menggunakan hook 'pre-save' di model untuk hashing,
      // cukup set password baru dan panggil .save().
      // Jika tidak, hash di sini:

      user.password = newPassword;
      // 5. Simpan Perubahan
      await user.save();

      res.status(200).json({ message: 'Kata sandi berhasil diubah.' });

  } catch (err) {
      console.error('Change Password Error:', err);
      res.status(500).send('Terjadi kesalahan pada server.');
  }
});
// Jangan lupa untuk mengekspor router!
module.exports = router;