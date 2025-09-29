// server.js

const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Impor aplikasi Express dari app.js
const app = require("./app");

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Inisialisasi Socket.IO di sini karena butuh 'server'
const io = new Server(server, {
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? "https://bapasjember.somasi.cloud"
        : "http://localhost:8080",
    credentials: true,
  },
});

// ==> PERUBAHAN 1: "Tempelkan" io ke instance app <==
app.set('io', io);

// Handler koneksi Socket.IO
io.on("connection", (socket) => {
  console.log("A client connected:", socket.id);

  // Example: Broadcast when a new entry is added
  socket.on("newEntry", (entry) => {
    io.emit("newEntry", entry); // Broadcast to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Jalankan server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Socket IO running on http://localhost:${PORT}`);
});
