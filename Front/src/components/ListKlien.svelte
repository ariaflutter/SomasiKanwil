<script>
  import { onMount } from "svelte";
  import Sidebar from "./Sidebar.svelte";
  import { GradientButton } from "flowbite-svelte";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  const apiUrl = import.meta.env.VITE_API_URL;

  // --- PERUBAHAN: Hapus state yang tidak diperlukan ---
  // namaPKList dan selectedNamaPK sudah tidak dipakai lagi.
  let myClients = []; // Menggantikan searchResults
  let filteredClients = []; // Menggantikan filteredResults
  let error = "";
  let loading = false;
  let tableSearch = "";

  // --- PERUBAHAN: Fungsi onMount diubah total ---
  // Sekarang ia langsung mengambil data klien milik user yang login.
  onMount(async () => {
    // Panggil fungsi untuk mengambil data.
    // Ini dibuat menjadi fungsi terpisah agar bisa dipanggil ulang setelah update.
    await fetchMyClients();
  });

  // Fungsi baru untuk mengambil data klien dari endpoint yang aman
  async function fetchMyClients() {
    loading = true;
    error = "";
    try {
        // --- LOGGING FORENSIK DI FRONTEND ---
        const finalUrl = `/api/my-clients`;
        console.log('[FRONTEND] Mencoba memanggil URL:', finalUrl);
        console.log('[FRONTEND] Dengan opsi:', { credentials: 'include' });
        // ------------------------------------

        const response = await fetch(finalUrl, {
            credentials: 'include'
        });
        
        console.log('[FRONTEND] Menerima respon dari server. Status:', response.status);

        if (!response.ok) {
            if (response.status === 401) {
                console.error('[FRONTEND] Akses ditolak (401). Redirect ke halaman login.');
                window.location.href = '/login';
                return;
            }
            const errData = await response.json();
            throw new Error(errData.message || 'Gagal mengambil data dari server.');
        }

        console.log('[FRONTEND] Berhasil mengambil data klien.');
        myClients = await response.json();
        filteredClients = myClients;
        
    } catch (err) {
        console.error("[FRONTEND] Terjadi error saat fetchMyClients:", err);
        error = "Gagal memuat data. Periksa konsol untuk detail.";
    } finally {
        loading = false;
    }
}


  // --- PERUBAHAN: Hapus fungsi searchByNamaPK() ---
  // Fungsi ini sudah tidak diperlukan sama sekali.


  // --- PERUBAHAN: Filter sekarang berjalan pada 'myClients' ---
  $: filteredClients = myClients.filter((item) =>
    item.Nama.toLowerCase().includes(tableSearch.toLowerCase())
  );


  // --- PERUBAHAN: Sedikit modifikasi pada fungsi update ---
  async function updateWajibLapor(clientId, status) {
    try {
      // Buat URL yang dinamis dengan ID klien
      const response = await fetch(`/api/update-wajiblapor/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        // Body sekarang hanya perlu mengirim status baru
        body: JSON.stringify({ status: status }),
        // WAJIB ada agar sesi terkirim dan otentikasi berhasil
        credentials: 'include' 
      });

      if (response.ok) {
        // Panggil ulang untuk me-refresh data di tabel
        await fetchMyClients();
      } else {
        const errorMessage = await response.json();
        console.error("Update failed:", errorMessage.message);
        error = "Gagal memperbarui status Wajib Lapor";
      }
    } catch (err) {
      console.error("Error updating WajibLapor:", err);
      error = "Gagal memperbarui status Wajib Lapor";
    }
  }

  // --- PERBAIKAN: Fungsi-fungsi ini sekarang meneruskan ID ---
  function handleGreenButton(clientId) {
    updateWajibLapor(clientId, "Ya");
  }

  function handleRedButton(clientId) {
    updateWajibLapor(clientId, "Tidak");
  }


  // ==================================================================
  // TIDAK ADA PERUBAHAN PADA FUNGSI-FUNGSI HELPER DI BAWAH INI
  // ==================================================================



  function getMasaBimbinganClass(date) {
    if (date === "0" || !isValidExcelDate(date)) {
      return "bg-gray-100 text-gray-800";
    }
    const parsedDate = convertExcelDateToJSDate(date);
    return parsedDate < new Date()
      ? "bg-red-100 text-red-800"
      : "bg-green-100 text-green-800";
  }



  function isValidExcelDate(date) {
    const timestamp = (date - 25569) * 86400 * 1000;
    return !isNaN(new Date(timestamp).getTime());
  }

  function convertExcelDateToJSDate(date) {
    const timestamp = (date - 25569) * 86400 * 1000;
    return new Date(timestamp);
  }
</script>

<Sidebar />

<div class="max-w-screen-xl w-screen mt-20 p-5">
  
  <!-- PERUBAHAN: Judul halaman diubah -->
  <h2 class="text-lg font-semibold mb-4">
    Daftar Klien Bimbingan Anda
  </h2>

  <!-- PERUBAHAN: Seluruh div yang berisi dropdown <select> dan tombol search DIHAPUS -->

  {#if error}
    <p class="text-red-500">{error}</p>
  {/if}

  <!-- PERUBAHAN: Kondisiampilan diubah total -->
  {#if loading}
    <p>Sedang memuat data klien...</p>
  {:else if myClients.length > 0}
    <!-- Tampilkan input search dan tabel hanya jika ada data -->
    <div class="my-4">
      <input
        type="text"
        placeholder="Cari Nama Klien disini..."
        bind:value={tableSearch}
        class="p-2 border rounded-2xl w-full"
      />
    </div>

    <Table class="rounded-xl">
      <TableHead>
        <TableHeadCell>Nama</TableHeadCell>
        <TableHeadCell>Nomor Register</TableHeadCell>
        <TableHeadCell>Akhir Bimbingan</TableHeadCell>
        <TableHeadCell>Wajib Lapor</TableHeadCell>
        <TableHeadCell>Tindakan</TableHeadCell>
      </TableHead>
      <TableBody>
        <!-- PERUBAHAN: Loop sekarang menggunakan 'filteredClients' -->
        {#each filteredClients as client}
          <TableBodyRow>
            <TableBodyCell>{client.Nama}</TableBodyCell>
            <TableBodyCell>{client.NomorRegisterIntegrasi || "-"}</TableBodyCell>
            <TableBodyCell>
              <span class={`px-2 py-1 rounded-full text-sm font-semibold flex justify-center ${getMasaBimbinganClass(client.MasaBimbinganSaatIniAkhir)}`}>
                {client.MasaBimbinganSaatIniAkhir}
              </span>
            </TableBodyCell>
            <TableBodyCell>
              <span class={`px-2 py-1 rounded-full text-sm font-semibold flex justify-center ${
                  client.WajibLapor === "Ya"
                    ? "bg-green-100 text-green-800"
                    : client.WajibLapor === "Tidak"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }`}>
                {client.WajibLapor === "Ya"
                  ? "Dapat Wajib Lapor"
                  : client.WajibLapor === "Tidak"
                    ? "Tidak Dapat Wajib Lapor"
                    : "Belum Dipilih"}
              </span>
            </TableBodyCell>
            <TableBodyCell>
              <GradientButton color="greenToBlue" on:click={() => handleGreenButton(client._id)} class="h-auto w-auto">
                Ya
              </GradientButton>
              <GradientButton color="pinkToOrange" on:click={() => handleRedButton(client._id)} class="h-auto w-auto">
                Tidak
              </GradientButton>
            </TableBodyCell>
          </TableBodyRow>
        {/each}
      </TableBody>
    </Table>
  {:else}
    <!-- PERUBAHAN: Tampilkan pesan ini jika tidak loading dan tidak ada klien -->
    <p>Anda belum memiliki data klien bimbingan.</p>
  {/if}
</div>

<!-- Semua style di bawah tidak perlu diubah -->
<style>
  select {
    min-width: 200px;
  }
</style>