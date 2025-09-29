// vite.config.js (VERSI FINAL DENGAN COOKIE PATH REWRITE)

import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  server: {
    // Pastikan Anda mengakses browser menggunakan 'localhost' BUKAN '127.0.0.1'
    // Port ini harus sesuai dengan yang Anda gunakan
    port: 8080, 

    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Alamat backend Anda
        changeOrigin: true,
        
        // --- INI ADALAH PERBAIKAN KUNCI ---
        // Menulis ulang Path cookie dari backend agar selalu '/'
        // Ini memastikan browser akan selalu mengirim cookie kembali.
        cookiePathRewrite: {
          '*': '/',
        },
        // ------------------------------------
      }
    }
  }
})