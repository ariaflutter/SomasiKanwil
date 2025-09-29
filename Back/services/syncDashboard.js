// services/syncDashboard.js
const { google } = require('googleapis');
const KEYFILEPATH = './credentials.json';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

let dashboardCache = null;
let perkembanganCache = null;

const syncDashboard = async () => {
  try {
    console.log('Syncing Dashboard & Perkembangan Klien...');

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Ambil Tabel Data (summary)
    const summaryRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'TabelData', // Named Range
    });

    const summaryRows = summaryRes.data.values || [];
    if (summaryRows.length > 0) {
      dashboardCache = {
        jumlahPegawai:summaryRows[1][1],
        jumlahKlienDewasa: summaryRows[2][1],
        jumlahHMBBulanIni: summaryRows[3][1],
        jumlahHMBTahunIni: summaryRows[4][1],
        jumlahKlienBaruTahunIni: summaryRows[5][1],
        jumlahKlienBaruBulanIni: summaryRows[6][1],
      };
    }

    // Ambil Perkembangan Klien (grafik harian)
    const perkembanganRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'PerkembanganKlien', // Named Range
    });

    const perkembanganRows = perkembanganRes.data.values || [];
    if (perkembanganRows.length > 1) {
      const headers = perkembanganRows[0];
      perkembanganCache = perkembanganRows.slice(1).map((row) => ({
        tanggal: row[0],
        jumlahKlienDewasa: row[1],
        jumlahHMB: row[2],
        jumlahKlienBaru: row[3],
      }));
    }

    console.log('✅ Sync complete: Tabel Data + Perkembangan Klien');
    return { dashboard: dashboardCache, perkembangan: perkembanganCache };
  } catch (err) {
    console.error('❌ Error syncing Dashboard:', err);
    return null;
  }
};

// getter buat route
const getDashboardData = () => dashboardCache;
const getPerkembanganData = () => perkembanganCache;

module.exports = { syncDashboard, getDashboardData, getPerkembanganData };
