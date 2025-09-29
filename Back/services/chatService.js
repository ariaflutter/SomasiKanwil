// services/chatService.js
const axios = require('axios');
const DataModel = require('../models/Data.js'); // Menggunakan DataModel yang konsisten

const permanentSystemMessage = {
    role: 'system',
    content: `Kamu adalah AkaneAI, asisten digital resmi Bapas Kelas II Jember... (isi lengkap seperti di kode asli Anda)`
};

function extractNamaFromMessage(message) {
    const quoted = message.match(/["']([^"']+)["']/);
    if (quoted) return quoted[1].trim();
    const pattern = message.match(/(?:atas\s+)?nama\s+(?:yang\s+bernama\s+)?([A-Z][a-z\s'.-]{2,})(?=$|[\s,.!?])/i);
    if (pattern) return pattern[1].trim();
    const fallback = message.match(/^([A-Z][a-z\s'.-]{2,})$/i);
    if (fallback) return fallback[1].trim();
    return null;
}

async function shouldAccessDatabase(userMessage) {
    const classificationPrompt = [{
        role: "system",
        content: `Tentukan apakah pesan berikut perlu akses database. Jawab YA atau TIDAK. Pesan: meminta informasi klien, nama, wajib lapor, litmas. Sapaan biasa: TIDAK.`
    }, {
        role: "user",
        content: userMessage
    }];
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: classificationPrompt
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.REFERER_URL || 'http://localhost:8080',
                'X-Title': 'AkaneAI Classifier'
            }
        });
        const answer = response.data.choices?.[0]?.message?.content?.trim().toLowerCase();
        return answer.startsWith("ya");
    } catch (err) {
        console.error("❌ Classifier error:", err.response?.data || err.message);
        return false;
    }
}

async function getClientDatabaseInfo(nama) {
    try {
        const results = await DataModel.find({ Nama: new RegExp(nama, 'i') }).lean();
        if (results.length === 0) {
            return `❌ Tidak ditemukan data untuk nama "${nama}".`;
        } else if (results.length === 1) {
            const result = results[0];
            return `📄 DATA KLIEN DITEMUKAN\nNAMA: ${result.Nama || "-"}\nSTATUS LITMAS: ${result.LitmasTerselesaikan === '☑' ? `SELESAI pada ${result.TanggalPenyelesaianLitmas || "-"}` : `BELUM SELESAI`}\nPK: ${result.NamaPK || "-"}\nALAMAT: ${result.Alamat || "-"}\nPERKARA: ${result.Perkara || "-"}\nPASAL: ${result.Pasal || "-"}\nWAJIB LAPOR: ${result.WajibLapor || "-"}\n`;
        } else {
            const names = results.map(r => r.Nama).join(', ');
            return `⚠️ Ditemukan beberapa hasil untuk "${nama}": ${names}. Mohon perjelas nama lengkap yang dimaksud.`;
        }
    } catch (err) {
        console.error("❌ Error while searching DB:", err);
        return "⚠️ Terjadi kesalahan saat mencari data di database.";
    }
}

const handleChatLogic = async (userMessages) => {
    const lastMessage = userMessages.at(-1)?.content || "";
    let databaseInfo = "";

    const accessDB = await shouldAccessDatabase(lastMessage);
    if (accessDB) {
        const nama = extractNamaFromMessage(lastMessage);
        if (nama) {
            databaseInfo = await getClientDatabaseInfo(nama);
        }
    }

    const finalMessages = [
        permanentSystemMessage,
        ...(databaseInfo ? [{ role: "system", content: databaseInfo }] : []),
        ...userMessages
    ];

    try {
        const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: finalMessages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.REFERER_URL || 'http://localhost:8080',
                'X-Title': 'AkaneAI Chat'
            }
        });
        return response.data.choices?.[0]?.message?.content || "⚠️ Tidak ada jawaban dari AI.";
    } catch (err) {
        console.error("❌ Chat API error:", err.response?.data || err.message);
        throw new Error("Terjadi kesalahan pada server AI.");
    }
};

module.exports = { handleChatLogic };