// vite.config.js (VERSI FINAL DENGAN COOKIE PATH REWRITE)

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    // Pastikan Anda mengakses browser menggunakan 'localhost' BUKAN '127.0.0.1'
    // Port ini harus sesuai dengan yang Anda gunakan
    port: 8080,
    host: '0.0.0.0', // Allow access from any device on the network
    cors: true,

    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Alamat backend Anda
        changeOrigin: true,
        secure: false, // Allow self-signed certificates
        
        // --- INI ADALAH PERBAIKAN KUNCI ---
        // Menulis ulang Path cookie dari backend agar selalu '/'
        // Ini memastikan browser akan selalu mengirim cookie kembali.
        cookiePathRewrite: {
          '*': '/',
        },
        // ------------------------------------
        
        // Additional headers for cross-browser compatibility
        onProxyReq: (proxyReq, req, res) => {
          proxyReq.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          proxyReq.setHeader('Pragma', 'no-cache');
          proxyReq.setHeader('Expires', '0');
        }
      }
    }
  },
  
  // Build optimizations for better browser compatibility
  build: {
    target: 'es2015', // Support older browsers
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['leaflet', 'chart.js', 'socket.io-client']
        }
      }
    }
  }
})