<script>
  // @ts-nocheck
  import "../app.css";
  import {
    Navbar,
    NavBrand,
    NavLi,
    NavUl,
    NavHamburger,
    Dropdown,
    DropdownItem,
    DropdownDivider,
    TextPlaceholder,
  } from "flowbite-svelte";
  import { ChevronDownOutline } from "flowbite-svelte-icons";
  import { SpeedDial, SpeedDialButton } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";

  import { onMount } from 'svelte';
  const apiUrl = import.meta.env.VITE_API_URL;

    // 1. Deklarasikan variabel reaktif untuk menampung nama instansi.
    //    Nilai awalnya adalah 'Memuat...' yang akan ditampilkan saat data sedang diambil.
    let instanceName = 'Memuat...';

    // 2. Gunakan onMount untuk menjalankan kode saat komponen pertama kali dirender.
    //    Ini adalah tempat yang tepat untuk melakukan fetch data dari API.
    onMount(async () => {
        try {
            // 3. Panggil endpoint /api/config yang ada di backend.
            const response = await fetch(`/api/config`);

            // Jika respons tidak sukses (misalnya, error 404 atau 500), lemparkan error.
            if (!response.ok) {
                throw new Error(`Gagal mengambil data: ${response.statusText}`);
            }

            const config = await response.json();

            // 4. Perbarui variabel instanceName dengan data dari API.
            //    Svelte akan secara otomatis memperbarui tampilan (DOM) untuk Anda.
            instanceName = config.instanceName;

        } catch (error) {
            console.error('Tidak dapat mengambil konfigurasi instansi:', error);
            // 5. Jika terjadi error, tampilkan nama default.
            instanceName = 'Bapas Jawa Timur';
        }
    });
</script>

<SpeedDial defaultClass="absolute end-6 bottom-20 fixed"><DarkMode /></SpeedDial
>
<div class="relative px-8 pb-20">
  <Navbar class="px-2 sm:px-4 py-2.5 fixed w-full z-20 top-0 start-0 border-b bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
    <NavBrand href="/">
      <img
        src="../Logo.png"
        class="me-3 h-6 sm:h-9"
        alt="Aksara Logo"
      />
      <span
        class="self-center whitespace-nowrap dark:text-white text-sm text-primary-600 font-semibold"
        >Aksara {instanceName}</span
      >
    </NavBrand>
    <DarkMode class="hidden" />
    <NavHamburger class="bg-white dark:bg-gray-800 hover:bg-gray-500" />
    <NavUl>
      <NavLi href="/">Home</NavLi>
      <NavLi href="/tentang">Tentang</NavLi>
      <NavLi href="/login">Login Petugas</NavLi>
    </NavUl>
  </Navbar>
</div>
