<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import BotNav from "./BotNav.svelte";
  import Sidebar from "./Sidebar.svelte";
  import { initFlowbite } from "flowbite";

  const apiUrl = import.meta.env.VITE_API_URL;

  let userData = null;
  let errorMessage = "";
  let wajibLaporResults = [];
  let randomImage = "/avatar.png";
  let isLoading = true;
  

  async function fetchData() {
    try {
      const urlParts = window.location.pathname.split("/");
      const userId = urlParts[urlParts.length - 1];
      if (!userId) throw new Error("ID Pengguna tidak valid");

      const userResponse = await fetch(`/api/user/${userId}`);
      if (!userResponse.ok) throw new Error("Gagal mengambil data pengguna");
      userData = await userResponse.json();

      if (!userData || !userData.Nama) return;

      const wajiblaporResponse = await fetch(
        `/api/search-wajib-lapor?nama=${encodeURIComponent(userData.Nama)}`
      );
      if (wajiblaporResponse.ok) {
        wajibLaporResults = await wajiblaporResponse.json();
      }

      // --- PERBAIKAN #1: Gunakan RegisterUtama untuk mengambil daftar gambar ---
      const imageResponse = await fetch(`/api/images/${encodeURIComponent(userData.RegisterUtama)}`);
      
      if (imageResponse.ok) {
        const images = await imageResponse.json();
        if (images.length > 0) {
          const randomImageName = images[Math.floor(Math.random() * images.length)];
          
          // --- PERBAIKAN #2: Gunakan RegisterUtama untuk membangun URL gambar ---
          randomImage = `/uploads/${userData.RegisterUtama}/${randomImageName}`;
        }
      }
    } catch (error) {
      errorMessage = error.message;
      console.error("Error during data fetch:", error);
    } finally {
      isLoading = false;
    }
  }

  function formatExcelDate(excelDate) {
    if (!excelDate || excelDate === "0" || isNaN(excelDate)) {
      return "-";
    }
    try {
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      if (isNaN(date.getTime())) {
          return "-";
      }
      return date.toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (e) {
      return "-";
    }
  }

  onMount(async () => {
    await fetchData();
    // --- PERBAIKAN KRUSIAL: Inisialisasi ulang Flowbite setelah Svelte selesai render ---
    // Ini memastikan semua elemen interaktif (seperti di Sidebar) berfungsi dengan benar
    initFlowbite();
  });
</script>

<Sidebar />

<div class="p-4 sm:ml-64 mt-16 mb-16">
  {#if isLoading}
    <p class="text-center">Loading data...</p>
  {:else if errorMessage}
    <div class="bg-red-100 text-red-800 p-4 rounded-lg">
      <p>Error: {errorMessage}</p>
    </div>
  {:else if userData}
    <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
      
      <!-- Kolom Kiri: Profil & Riwayat Wajib Lapor -->
      <div class="md:col-span-1 space-y-4">
        <!-- Kartu Profil -->
        <div class="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
          <img
            src={randomImage}
            alt="Foto Profil"
            class="h-24 w-24 rounded-lg object-cover bg-gray-200"
            on:error={(e) => (e.target.src = "/avatar.png")}
          />
          <div>
            <h3 class="text-xl font-bold text-gray-900">{userData.Nama}</h3>
            <p class="text-sm text-gray-500">Profil Klien</p>
          </div>
        </div>

        <!-- Kartu Riwayat Wajib Lapor -->
        <div class="bg-white p-4 rounded-lg shadow-md">
           <h3 class="text-lg font-semibold mb-3">Riwayat Wajib Lapor</h3>
           {#if wajibLaporResults.length > 0}
             <div class="space-y-3 max-h-96 overflow-y-auto pr-2">
               {#each wajibLaporResults as result}
                 <div class="bg-gray-50 rounded-lg p-3 border">
                   <p class="font-semibold text-sm">Tanggal: {result.TanggalHariIni}</p>
                   <div class="flex justify-between items-center mt-2">
                      <a
                        href={`https://maps.google.com/?q=${result.latitude},${result.longitude}`}
                        target="_blank"
                        class="text-blue-600 hover:underline text-xs"
                      >
                        Lihat Lokasi
                      </a>
                      {#if result.photoPath}
                        <a href="{apiUrl}{result.photoPath}" target="_blank" class="text-blue-600 hover:underline text-xs">
                           Lihat Foto
                        </a>
                      {/if}
                   </div>
                 </div>
               {/each}
             </div>
           {:else}
             <p class="text-sm text-gray-500">Belum ada riwayat wajib lapor.</p>
           {/if}
        </div>
      </div>

      <!-- Kolom Kanan: Informasi Detail Klien -->
      <div class="md:col-span-2 bg-white p-6 rounded-lg shadow-md">
        <h3 class="text-xl font-semibold mb-4">Informasi Detail Klien</h3>
        
        <!-- === BAGIAN YANG DIPERBAIKI === -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          
          <div class="sm:col-span-2">
            <label class="font-medium text-gray-600 block mb-1">Alamat</label>
            <input value={userData.Alamat || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          
          <div>
            <label class="font-medium text-gray-600 block mb-1">Register Litmas</label>
            <input value={userData.NoRegisterLitmas || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Register Integrasi</label>
            <input value={userData.NomorRegisterIntegrasi || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          
          <div class="sm:col-span-2">
            <label class="font-medium text-gray-600 block mb-1">Pembimbing Kemasyarakatan</label>
            <input value={userData.NamaPK || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>

          <div>
            <label class="font-medium text-gray-600 block mb-1">Jenis Kelamin</label>
            <input value={userData.JenisKelamin || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Agama</label>
            <input value={userData.Agama || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Tanggal Lahir</label>
            <input value={userData.TanggalLahir} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Tempat Lahir</label>
            <input value={userData.TempatLahir || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Pendidikan</label>
            <input value={userData.Pendidikan || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Pekerjaan</label>
            <input value={userData.Pekerjaan || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Katagori</label>
            <input value={userData.Katagori || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div>
            <label class="font-medium text-gray-600 block mb-1">Pasal</label>
            <input value={userData.Pasal || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>

          <div class="sm:col-span-2">
            <label class="font-medium text-gray-600 block mb-1">Nama Penjamin</label>
            <input value={userData.NamaPenjamin || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>
          <div class="sm:col-span-2">
            <label class="font-medium text-gray-600 block mb-1">Alamat Penjamin</label>
            <input value={userData.AlamatPenjamin || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
          </div>

          <div class="sm:col-span-2 border-t pt-4 mt-2">
            <h4 class="font-semibold text-base mb-2">Pidana</h4>
            <div class="grid grid-cols-3 gap-4">
              <div>
                <label class="font-medium text-gray-600 block mb-1">Tahun</label>
                <input value={userData.PidanaTahun || '0'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
              </div>
              <div>
                <label class="font-medium text-gray-600 block mb-1">Bulan</label>
                <input value={userData.PidanaBulan || '0'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
              </div>
              <div>
                <label class="font-medium text-gray-600 block mb-1">Hari</label>
                <input value={userData.PidanaHari || '0'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
              </div>
            </div>
          </div>
          
          <div class="sm:col-span-2 border-t pt-4 mt-2">
            <h4 class="font-semibold text-base mb-2">Integrasi</h4>
            <div>
              <label class="font-medium text-gray-600 block mb-1">Nomor SK Integrasi</label>
              <input value={userData.NomorSKIntegrasi || '-'} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
            </div>
            <div class="mt-4">
              <label class="font-medium text-gray-600 block mb-1">Tanggal SK</label>
              <input value={userData.TanggalSKIntegrasi} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
            </div>
            <div class="mt-4">
              <label class="font-medium text-gray-600 block mb-1">Habis Masa Bimbingan</label>
              <input value={userData.MasaBimbinganSaatIniAkhir} readonly class="w-full p-2 bg-gray-100 border rounded-md cursor-not-allowed">
            </div>
          </div>

        </div>
      </div>
    </div>
  {:else}
    <p class="text-center">Data pengguna tidak ditemukan.</p>
  {/if}
</div>

<BotNav />