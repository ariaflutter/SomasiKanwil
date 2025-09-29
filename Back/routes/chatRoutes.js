// routes/chatRoutes.js
const express = require('express');
const router = express.Router();

// Impor logika chat dari service
const { handleChatLogic } = require('../services/chatService.js');

router.post('/chat', async (req, res) => {
    try {
        const userMessages = req.body.messages;
        if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
            return res.status(400).json({ reply: "Pesan tidak valid." });
        }
        
        const reply = await handleChatLogic(userMessages);
        res.json({ reply });

    } catch (error) {
        // Error yang dilempar dari service akan ditangkap di sini
        res.status(500).json({ reply: error.message });
    }
});

module.exports = router;