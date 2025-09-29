<script lang="ts">
    import { Card, Input, Button, Spinner, Alert } from "flowbite-svelte";
  
    // --- Konfigurasi ---
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  
    // --- State untuk Form Input ---
    let currentPassword = "";
    let newPassword = "";
    let confirmPassword = "";
  
    // --- State untuk Feedback ke Pengguna ---
    let isLoading = false;
    let errorMessage = "";
    let successMessage = "";
  
    // Fungsi yang dipanggil saat form disubmit
    async function handleChangePassword() {
      // 1. Reset state feedback
      isLoading = true;
      errorMessage = "";
      successMessage = "";
  
      // 2. Validasi di sisi client terlebih dahulu
      if (!currentPassword || !newPassword || !confirmPassword) {
        errorMessage = "Semua field harus diisi.";
        isLoading = false;
        return;
      }
      if (newPassword !== confirmPassword) {
        errorMessage = "Konfirmasi kata sandi baru tidak cocok.";
        isLoading = false;
        return;
      }
      if (newPassword.length < 8) {
        errorMessage = "Kata sandi baru minimal harus 8 karakter.";
        isLoading = false;
        return;
      }
  
      // 3. Kirim data ke API
      try {
        const response = await fetch(`/api/auth/change-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // PENTING: 'include' memastikan cookie sesi dikirim bersama permintaan
          credentials: 'include',
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword
          })
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          // Jika server mengembalikan error (400, 401, dll)
          throw new Error(result.message || 'Terjadi kesalahan.');
        }
  
        // Jika berhasil
        successMessage = result.message;
        // Kosongkan form setelah berhasil
        currentPassword = "";
        newPassword = "";
        confirmPassword = "";
  
      } catch (error: any) {
        errorMessage = error.message;
      } finally {
        isLoading = false;
      }
    }
  </script>
  
  <main class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
    <div class="w-full max-w-lg">
      <Card>
        <form class="flex flex-col space-y-6" on:submit|preventDefault={handleChangePassword}>
          <h3 class="text-xl font-medium text-gray-900 dark:text-white">
            Ubah Kata Sandi Anda
          </h3>
  
          <!-- Tampilkan pesan Error atau Sukses -->
          {#if errorMessage}
            <Alert color="red" on:close={() => errorMessage = ''}>
              <span class="font-medium">Gagal!</span> {errorMessage}
            </Alert>
          {/if}
          {#if successMessage}
            <Alert color="green" on:close={() => successMessage = ''}>
              <span class="font-medium">Berhasil!</span> {successMessage}
            </Alert>
          {/if}
          
          <!-- Input Kata Sandi Saat Ini -->
          <div>
            <label for="current-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Kata Sandi Saat Ini</label>
            <Input 
              type="password" 
              id="current-password" 
              placeholder="••••••••" 
              required 
              bind:value={currentPassword}
            />
          </div>
  
          <!-- Input Kata Sandi Baru -->
          <div>
            <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Kata Sandi Baru</label>
            <Input 
              type="password" 
              id="new-password" 
              placeholder="Minimal 8 karakter" 
              required 
              bind:value={newPassword}
            />
          </div>
  
          <!-- Input Konfirmasi Kata Sandi Baru -->
          <div>
            <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Konfirmasi Kata Sandi Baru</label>
            <Input 
              type="password" 
              id="confirm-password" 
              placeholder="Ulangi kata sandi baru" 
              required 
              bind:value={confirmPassword}
            />
          </div>
  
          <!-- Tombol Submit -->
          <Button type="submit" class="w-full" disabled={isLoading}>
            {#if isLoading}
              <Spinner class="mr-3" size="4" />
              Memproses...
            {:else}
              Ubah Kata Sandi
            {/if}
          </Button>
        </form>
      </Card>
    </div>
  </main>