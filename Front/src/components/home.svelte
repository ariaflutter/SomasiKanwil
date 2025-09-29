<script>
  import { onMount } from "svelte";
  import {
    Heading,
    P,
    // @ts-ignore
    A,
    Span,
    // @ts-ignore
    Hr,
    GradientButton,
    Gallery,
  } from "flowbite-svelte";
  import { ChevronDownOutline, ArrowRightOutline } from "flowbite-svelte-icons";

  // Komponen navigasi dan footer Anda tetap digunakan
  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";

  // Variabel untuk API URL dari .env
  // @ts-ignore
  const apiUrl = import.meta.env.VITE_API_URL;


  // Fetch data berita saat komponen dimuat
   // State untuk menyimpan data berita dan nama instansi
   let beholdData = [];
  let instanceName = 'Bapas Jawa Timur'; // Deklarasi variabel dengan nilai default

  // Menggabungkan semua proses fetch data awal ke dalam satu onMount
  onMount(async () => {
    // --- Fetch data berita ---
    try {
      const response = await fetch(`/api/behold-data`);
      if (!response.ok) throw new Error("Gagal mengambil data berita");
      
      const data = await response.json();
      // @ts-ignore
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      beholdData = data.slice(0, 6);
    } catch (error) {
      console.error("Error fetching image data:", error);
    }

    // --- Fetch data konfigurasi (instanceName) ---
    try {
      const response = await fetch(`/api/config`);
      if (!response.ok) {
        throw new Error(`Gagal mengambil data config: ${response.statusText}`);
      }
      const config = await response.json();
      instanceName = config.instanceName;
    } catch (error) {
      console.error('Tidak dapat mengambil konfigurasi instansi:', error);
      // Biarkan instanceName menggunakan nilai default jika fetch gagal
    }
  });

  // Fungsi untuk scroll ke section tertentu dengan smooth
  function scrollTo(selector) {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }


</script>

<!-- 
  Struktur Utama Halaman
  Nav dan BotNav berada di luar container scroll utama 
  agar posisinya tetap (fixed).
-->
<div class="h-screen w-screen flex flex-col">
  <Nav />

  <!-- Container Utama yang bisa di-scroll -->
  <main class="flex-grow overflow-y-auto scroll-smooth snap-y snap-mandatory">
    <!-- 
      SECTION 1: HERO IMAGE (Tampilan Penuh Pertama)
    -->
    <section
      id="hero"
      class="h-[40vh] w-full relative flex items-center justify-center snap-start"
    >
      <!-- Background Image -->
      <div
        class="absolute inset-0 bg-cover bg-center z-0"
        style="background-image: url('https://asset.kompas.com/crops/FJylOb_m0VcZP6BxDpBqj02O0w8=/0x0:750x500/750x500/data/photo/2022/02/16/620ca77c7763a.jpg');"
      >
        <!-- Overlay gelap agar teks lebih mudah dibaca -->
        <div class="absolute inset-0 bg-black opacity-90"></div>
      </div>

      <!-- Konten di atas background -->
      <div class="relative z-10 text-left text-white px-4">
        <Heading
          tag="h1"
          class="mb-4"
          customSize="text-4xl font-extrabold md:text-5xl lg:text-7xl"
        >
          <Span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-400 from-cyan-300">
            Somasi
          </Span>
          <Span class="text-gray-200">{instanceName}</Span>
       
        </Heading>
        <P class="text-lg md:text-xl font-light text-gray-200">
          Layanan terintegrasi untuk masa depan pemasyarakatan yang lebih baik.
        </P>
      </div>

      <!-- Tombol Scroll ke Bawah -->
      <button
        on:click={() => scrollTo('#berita')}
        class="absolute bottom-10 z-10 text-white animate-bounce"
        aria-label="Scroll ke bagian berita"
      >
        <ChevronDownOutline size="xl" />
      </button>
    </section>

    <!-- 
      SECTION 2: BERITA (Tampilan Penuh Kedua)
    -->
    <section
      id="berita"
      class="h-full w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center snap-start p-4 pt-16 pb-24"
    >
      <div class="container text-center max-w-screen-xl h-full flex flex-col">
        <h2 class="text-3xl font-bold pb-6 text-gray-900 dark:text-white">
          Somasi Bapas Jawa Timur
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
          <a href="https://bapasjember.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Jember</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapassurabaya.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Surabaya</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapasmalang.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Malang</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapasmadiun.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Madiun</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapasbojonegoro.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Bojonegoro</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapaskediri.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Kediri</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
          <a href="https://bapaspamekasan.somasi.cloud" target="_blank" class="p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white">Bapas Pamekasan</h3>
            <p class="text-gray-500 dark:text-gray-300">Klik untuk kunjungi website</p>
          </a>
        </div>
        
      </div>
    </section>

    <!-- 
      SECTION 3: PENJELASAN (Tampilan Penuh Ketiga)
    -->
    <section
      id="penjelasan"
      class="h-full w-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center snap-start text-center p-4"
    >
      <div class="max-w-screen-md">
        <Heading
          tag="h2"
          class="mb-4"
          customSize="text-3xl font-extrabold md:text-4xl lg:text-5xl text-gray-900 dark:text-white"
        >
          Apa itu
          <Span class="text-transparent bg-clip-text bg-gradient-to-r to-blue-600 from-cyan-300">
            Somasi V2?
          </Span>
        </Heading>
        <P class="text-gray-600 dark:text-gray-300 md:text-lg mb-8">
          Somasi V2 adalah sebuah platform digital terpadu yang dirancang untuk mendukung reformasi birokrasi dan meningkatkan transparansi layanan di seluruh Balai Pemasyarakatan di Jawa Timur. Sistem ini memberikan akses mudah terhadap informasi, program, dan data secara real-time.
        </P>
        <GradientButton color="cyanToBlue" href="/tentang">
          Pelajari Lebih Lanjut
          <ArrowRightOutline class="w-5 h-5 ms-2" />
        </GradientButton>
      </div>
    </section>
  </main>


</div>

<style>
  /*
    Style ini penting untuk menciptakan efek scroll-snap 
    dan memastikan layout berfungsi dengan baik.
  */
  main {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  main::-webkit-scrollbar {
    display: none;
  }
</style>