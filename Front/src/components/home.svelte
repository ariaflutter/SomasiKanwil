<script lang="ts">
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
  import io from "socket.io-client";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import Sidebar from "./Sidebar.svelte";
  import { Card, Spinner, Badge, Datepicker } from "flowbite-svelte";
  import Chart from 'chart.js/auto';


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



  // Komponen UI

  // --- DAFTAR API BAPAS ---
  const BAPAS_LIST = [
    { name: 'Bapas Jember', url: 'https://bapasjember.somasi.cloud' },
    { name: 'Bapas Surabaya', url: 'https://bapassurabaya.somasi.cloud' },
    { name: 'Bapas Malang', url: 'https://bapasmalang.somasi.cloud' },
    { name: 'Bapas Madiun', url: 'https://bapasmadiun.somasi.cloud' },
    { name: 'Bapas Bojonegoro', url: 'https://bapasbojonegoro.somasi.cloud' },
    { name: 'Bapas Kediri', url: 'https://bapaskediri.somasi.cloud' },
    { name: 'Bapas Pamekasan', url: 'https://bapaspamekasan.somasi.cloud' },
  ];

  // --- Palet Warna untuk Setiap Bapas ---
  const BAPAS_COLORS = {
    'Bapas Jember': '#1e47d9',
    'Bapas Surabaya': '#d91eaa',
    'Bapas Malang': '#5fde77',
    'Bapas Madiun': '#c305ed',
    'Bapas Bojonegoro': '#E9C46A',
    'Bapas Kediri': '#2A9D8F',
    'Bapas Pamekasan': '#F4A261',
    'Default': '#A8DADC'
  };

  // --- STATE MANAGEMENT ---
  let stats: any = {};
  let perkembangan: any[] = [];
  let aktivitasTerbaru: any[] = [];
  let loading = true;
  let error = "";
  let connectionStatus = "Menyambungkan...";
  let lastNotification: any = null;
  let currentTime = new Date();
  let timer: NodeJS.Timeout;
  let bapasStatus: { name: string, status: 'Online' | 'Offline' | 'Loading' }[] = BAPAS_LIST.map(b => ({ name: b.name, status: 'Loading' }));

  // --- STATE PETA ---
  let map: L.Map;
  let mapMarkers: L.Marker[] = [];
  // --- PERUBAHAN: Menggunakan state terpisah untuk bulan dan tahun ---
  let selectedMonth: number = new Date().getMonth(); // 0 for January, 11 for December
  let selectedYear: number = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);


  // --- VARIABEL GRAFIK ---
  let lineCanvas: HTMLCanvasElement;
  let monthlyTrendsCanvas: HTMLCanvasElement;
  let dailyReportsCanvas: HTMLCanvasElement;
  let lineChartInstance: Chart;
  let monthlyTrendsInstance: Chart;
  let dailyReportsInstance: Chart;

  // --- KONFIGURASI GRAFIK ---
  const lineChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Tren Klien Dewasa Aktif' } }, scales: { y: { beginAtZero: false } } };
  const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' as const }, title: { display: true, text: 'Tren Bulanan (HMB vs Klien Baru)'} }, scales: { y: { beginAtZero: true } } };
  const dailyReportsOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, title: { display: true, text: 'Jumlah Wajib Lapor Harian (30 Hari Terakhir)'} }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } };
  
  // --- DATA GRAFIK ---
  let lineChartData: any = null;
  let monthlyTrendsData: any = null;
  let dailyReportsData: any = null;

  function processDataForCharts(data: any[]) {
    if (!data || data.length === 0) return;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    const monthlyHMB = Array(12).fill(0);
    const monthlyKlienBaru = Array(12).fill(0);
    data.forEach(item => {
      const parts = item.tanggal.split('-');
      if (parts.length === 3) {
        const month = parseInt(parts[1], 10);
        if (month >= 1 && month <= 12) {
          monthlyHMB[month - 1] += Number(item.jumlahHMB);
          monthlyKlienBaru[month - 1] += Number(item.jumlahKlienBaru);
        }
      }
    });
    lineChartData = { labels: data.map(d => d.tanggal), datasets: [{ label: 'Total Klien Dewasa', data: data.map(d => Number(d.jumlahKlienDewasa)), borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.3, pointRadius: 0 }] };
    monthlyTrendsData = { labels: months, datasets: [ { label: 'Jumlah HMB', data: monthlyHMB, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderWidth: 1 }, { label: 'Klien Baru', data: monthlyKlienBaru, backgroundColor: 'rgba(139, 92, 246, 0.7)', borderWidth: 1 } ] };
  }
  
  function processDataForDailyReportsChart(data: any[]) {
    if (!data || data.length === 0) {
      dailyReportsData = { labels: ['Tidak ada data'], datasets: [{ label: 'Jumlah Laporan', data: [0] }] };
      return;
    }
    dailyReportsData = {
        labels: data.map(d => d._id),
        datasets: [{ label: 'Jumlah Laporan', data: data.map(d => d.jumlah), backgroundColor: 'rgba(239, 68, 68, 0.7)', borderColor: 'rgb(239, 68, 68)', borderWidth: 1, barThickness: 'flex', maxBarThickness: 20 }]
    };
  }
  
  async function fetchAndAggregateAllData() {
    const fetchPromises = BAPAS_LIST.map(bapas =>
        fetch(`${bapas.url}/api/dashboard`)
            .then(response => {
                if (!response.ok) throw new Error(`Gagal memuat dari ${bapas.name}`);
                return response.json();
            })
            .then(data => ({ name: bapas.name, status: 'fulfilled', value: data }))
            .catch(error => ({ name: bapas.name, status: 'rejected', reason: error.toString() }))
    );

    const results = await Promise.all(fetchPromises);

    let aggregatedStats = {
        jumlahKlienDewasa: 0,
        jumlahHMBBulanIni: 0,
        jumlahHMBTahunIni: 0,
        jumlahKlienBaruTahunIni: 0,
        jumlahKlienBaruBulanIni: 0
    };

    let aggregatedPerkembangan = new Map<string, { jumlahHMB: number, jumlahKlienBaru: number, jumlahKlienDewasa: number }>();
    let aggregatedLaporanHarian = new Map<string, number>();
    let combinedAktivitasTerakhir: any[] = [];
    
    const newBapasStatus = results.map(result => {
        if (result.status === 'fulfilled') {
            const data = result.value;
            Object.entries(aggregatedStats).forEach(([key]) => {
                aggregatedStats[key as keyof typeof aggregatedStats] += Number(data.summary?.[key]) || 0;
            });
            const aktivitasDariBapasIni = (data.aktivitasTerakhir || []).map((item: any) => ({
                ...item, namaBapas: result.name
            }));
            combinedAktivitasTerakhir.push(...aktivitasDariBapasIni);
            (data.perkembangan || []).forEach((p: any) => {
                const existing = aggregatedPerkembangan.get(p.tanggal) || { jumlahHMB: 0, jumlahKlienBaru: 0, jumlahKlienDewasa: 0 };
                existing.jumlahHMB += Number(p.jumlahHMB) || 0;
                existing.jumlahKlienBaru += Number(p.jumlahKlienBaru) || 0;
                existing.jumlahKlienDewasa += Number(p.jumlahKlienDewasa) || 0;
                aggregatedPerkembangan.set(p.tanggal, existing);
            });
            (data.laporanHarian || []).forEach((h: any) => {
                const existingCount = aggregatedLaporanHarian.get(h._id) || 0;
                aggregatedLaporanHarian.set(h._id, existingCount + (Number(h.jumlah) || 0));
            });
            return { name: result.name, status: 'Online' as const };
        } else {
            return { name: result.name, status: 'Offline' as const };
        }
    });

    const finalPerkembangan = Array.from(aggregatedPerkembangan.entries())
        .map(([tanggal, values]) => ({ tanggal, ...values }))
        .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime());
    const finalLaporanHarian = Array.from(aggregatedLaporanHarian.entries())
        .map(([_id, jumlah]) => ({ _id, jumlah }))
        .sort((a, b) => new Date(a._id).getTime() - new Date(b._id).getTime());
    combinedAktivitasTerakhir.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const finalAktivitas = combinedAktivitasTerakhir.slice(0, 10).map(item => ({
        nama: `${item.Nama} (${item.namaBapas})`,
        waktu: new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        jenis: 'Wajib Lapor'
    }));
    
    return {
        aggregatedStats,
        finalPerkembangan,
        finalLaporanHarian,
        finalAktivitas,
        newBapasStatus
    };
}

  async function fetchDashboardData() {
    if (!loading) loading = true;
    error = "";
    try {
        const data = await fetchAndAggregateAllData();
        stats = data.aggregatedStats;
        perkembangan = data.finalPerkembangan;
        aktivitasTerbaru = data.finalAktivitas;
        bapasStatus = data.newBapasStatus;
        processDataForCharts(data.finalPerkembangan);
        processDataForDailyReportsChart(data.finalLaporanHarian);
    } catch (e: any) {
        error = "Terjadi kesalahan saat mengambil data gabungan: " + e.message;
    } finally {
        loading = false;
    }
}

  // --- FUNGSI PETA YANG DIMODIFIKASI ---

  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  function formatApiDate(date: Date): string {
    return date.toLocaleDateString("en-CA");
  }

  function clearMapMarkers() { 
    if(map) { 
      mapMarkers.forEach(marker => marker.remove()); 
    } 
    mapMarkers = []; 
  }

  async function fetchLocationsForMap(month: number, year: number) {
    console.log(`[PETA] Memulai fetch untuk seluruh bulan: ${month + 1}/${year}`);
    clearMapMarkers();

    const daysInMonth = getDaysInMonth(year, month);
    const allFetchPromises = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateForDay = new Date(year, month, day);
      const dateString = formatApiDate(dateForDay);
      const dailyPromises = BAPAS_LIST.map(bapas =>
        fetch(`${bapas.url}/api/search-wajib-lapor-by-date?date=${dateString}`)
          .then(res => res.ok ? res.json() : [])
          .then(data => data.map(item => ({ ...item, namaBapas: bapas.name, bapasUrl: bapas.url })))
          .catch(err => {
            console.error(`Gagal fetch untuk ${bapas.name} pada ${dateString}:`, err);
            return [];
          })
      );
      allFetchPromises.push(...dailyPromises);
    }

    const results = await Promise.allSettled(allFetchPromises);
    
    const successfulResults = results
      .filter(result => result.status === 'fulfilled' && result.value.length > 0)
      .map(result => result.value);
    const combinedData = successfulResults.flat();

    console.log(`[PETA] Total data gabungan yang diterima untuk bulan ini: ${combinedData.length} item.`);

    if (combinedData.length === 0) {
      console.log("[PETA] Tidak ada data untuk ditampilkan pada bulan ini, proses berhenti.");
      return;
    }

    let validCoordsCount = 0;
    let invalidCoordsCount = 0;

    mapMarkers = combinedData.map((item: any, index: number) => {
      const lat = parseFloat(item.latitude);
      const lng = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        if (invalidCoordsCount < 5) {
          console.error(`[PETA] KOORDINAT TIDAK VALID di item #${index}:`, { nama: item.Nama, lat_asli: item.latitude, lng_asli: item.longitude });
        }
        invalidCoordsCount++;
        return null;
      }
      
      validCoordsCount++;
      
      const bapasName = item.namaBapas;
      const color = BAPAS_COLORS[bapasName] || BAPAS_COLORS['Default'];

      const svgIconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="${color}" stroke="#FFFFFF" stroke-width="1.5" d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5a3 3 0 110-6 3 3 0 010 6z"/>
        </svg>`;

      const icon = L.divIcon({
        html: svgIconHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });
      
      const marker = L.marker([lat, lng], { icon });
      const fullPhotoPath = `${item.bapasUrl}${item.photoPath}`; 
      const popupContent = `<div style="font-family: sans-serif; font-size: 14px; max-width: 250px;"><strong style="font-size: 16px;">${item.Nama}</strong><em style="display: block; font-size: 12px; color: #555;">(${item.namaBapas})</em><hr style="margin: 4px 0;"><strong>Alamat:</strong> ${item.Alamat}<br><strong>Pasal:</strong> ${item.Pasal}<br><strong>Nama PK:</strong> ${item.NamaPK}<br><a href="${fullPhotoPath}" target="_blank" rel="noopener noreferrer"><img src="${fullPhotoPath}" alt="Foto Wajib Lapor" style="width: 100%; height: auto; margin-top: 8px; border-radius: 4px;"></a></div>`;
      marker.bindPopup(popupContent);
      return marker;
    }).filter(marker => marker !== null) as L.Marker[];
    
    console.log(`[PETA] Ringkasan Koordinat: ${validCoordsCount} valid, ${invalidCoordsCount} tidak valid.`);
    console.log(`[PETA] Jumlah marker yang akan ditambahkan ke peta: ${mapMarkers.length}`);

    if (map) {
        mapMarkers.forEach(marker => marker.addTo(map));
        console.log("[PETA] SUKSES: Semua marker telah ditambahkan ke peta.");
    } else {
        console.error("[PETA] FATAL: Variabel 'map' tidak terdefinisi saat mencoba menambahkan marker!");
    }
  }

  // --- PERUBAHAN: Handler baru untuk UI bulan/tahun ---
  function handleMonthYearChange() {
    fetchLocationsForMap(selectedMonth, selectedYear);
  }

  onMount(async () => {
    await fetchDashboardData();

    if (!error) {
      if (lineCanvas) lineChartInstance = new Chart(lineCanvas, { type: 'line', data: lineChartData, options: lineChartOptions });
      if (monthlyTrendsCanvas) monthlyTrendsInstance = new Chart(monthlyTrendsCanvas, { type: 'bar', data: monthlyTrendsData, options: barChartOptions });
      if (dailyReportsCanvas) dailyReportsInstance = new Chart(dailyReportsCanvas, { type: 'bar', data: dailyReportsData, options: dailyReportsOptions });
    }
    
    setTimeout(async () => {
      if (document.getElementById('map') && !map) {
        map = L.map("map").setView([-7.5666, 112.7521], 7.5);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
        
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
            div.style.padding = '10px';
            div.style.borderRadius = '5px';
            div.style.boxShadow = '0 0 15px rgba(0,0,0,0.2)';
            
            let labels = ['<strong>Legenda Bapas</strong>'];
            for (const bapasName in BAPAS_COLORS) {
                if (bapasName !== 'Default') {
                  labels.push(
                      `<div style="display: flex; align-items: center; margin-top: 5px;">
                         <i style="background:${BAPAS_COLORS[bapasName]}; width: 18px; height: 18px; border-radius: 50%; margin-right: 8px;"></i>
                         ${bapasName.replace('Bapas ', '')}
                       </div>`
                  );
                }
            }
            div.innerHTML = labels.join('');
            return div;
        };
        legend.addTo(map);

        // --- PERUBAHAN: Panggilan awal menggunakan state bulan/tahun ---
        await fetchLocationsForMap(selectedMonth, selectedYear);
      }
    }, 0);
    
    timer = setInterval(() => { currentTime = new Date(); }, 1000);
    const sockets = BAPAS_LIST.map(bapas => {
        const socket = io(bapas.url, { transports: ["websocket"] });
        socket.on("connect", () => console.log(`Connected to Socket.IO at ${bapas.name}`));
        socket.on("disconnect", () => console.log(`Disconnected from Socket.IO at ${bapas.name}`));
        socket.on("laporan_baru", async (laporanBaru) => {
            lastNotification = { ...laporanBaru, namaBapas: bapas.name };
            setTimeout(() => (lastNotification = null), 5000);
            try {
                const data = await fetchAndAggregateAllData();
                stats = data.aggregatedStats;
                perkembangan = data.finalPerkembangan;
                aktivitasTerbaru = data.finalAktivitas;
                bapasStatus = data.newBapasStatus;
                processDataForCharts(data.finalPerkembangan);
                processDataForDailyReportsChart(data.finalLaporanHarian);
            } catch (e) {
                console.error("Gagal refresh data via socket:", e);
            }

            // --- PERUBAHAN: Logika refresh menggunakan state bulan/tahun ---
            const newReportDate = new Date(laporanBaru.timestamp);
            if (newReportDate.getMonth() === selectedMonth && newReportDate.getFullYear() === selectedYear) {
                fetchLocationsForMap(selectedMonth, selectedYear);
            }
        });
        return socket;
    });

    return () => {
      lineChartInstance?.destroy();
      monthlyTrendsInstance?.destroy();
      dailyReportsInstance?.destroy();
      sockets.forEach(socket => socket.disconnect());
      clearInterval(timer);
      map?.remove();
    };
  });
  
  $: if (lineChartInstance && lineChartData) { lineChartInstance.data = lineChartData; lineChartInstance.update(); }
  $: if (monthlyTrendsInstance && monthlyTrendsData) { monthlyTrendsInstance.data = monthlyTrendsData; monthlyTrendsInstance.update(); }
  $: if (dailyReportsInstance && dailyReportsData) { dailyReportsInstance.data = dailyReportsData; dailyReportsInstance.update(); }

</script>

<!-- 
  Struktur Utama Halaman
-->
<div class="h-screen w-screen flex flex-col">
  <Nav />

  <!-- Container Utama yang bisa di-scroll -->
  <main class="flex-grow overflow-y-auto scroll-smooth">
    <!-- SECTION 1: HERO IMAGE -->
    <section
      id="hero"
      class="h-[40vh] w-full relative flex items-center justify-center snap-start"
    >
      <div
        class="absolute inset-0 bg-cover bg-center z-0"
        style="background-image: url('https://asset.kompas.com/crops/FJylOb_m0VcZP6BxDpBqj02O0w8=/0x0:750x500/750x500/data/photo/2022/02/16/620ca77c7763a.jpg');"
      >
        <div class="absolute inset-0 bg-black opacity-90"></div>
      </div>

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

      <button
        on:click={() => scrollTo('#berita')}
        class="absolute bottom-10 z-10 text-white animate-bounce"
        aria-label="Scroll ke bagian berita"
      >
        <ChevronDownOutline size="xl" />
      </button>
    </section>

    <!-- SECTION 2: BAPAS LIST -->
    <section
      id="berita"
      class=" w-full bg-white dark:bg-gray-900 flex flex-col items-center justify-center snap-start p-4 pt-10 pb-10"
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

    <!-- SECTION 3: DASHBOARD -->
    
    <section class="w-full   flex flex-col p-10">
      {#if lastNotification}
        <div class="fixed top-20 right-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg z-[1000] animate-bounce">
          <p class="font-bold">📢 Laporan Baru dari {lastNotification.namaBapas}!</p>
          <p class="text-sm">{lastNotification.Nama} baru saja melapor.</p>
        </div>
      {/if}

      <!-- Header Halaman -->
      <header class="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <Heading tag="h1" class="text-3xl font-extrabold text-gray-800 dark:text-white">Dashboard Analitik Kanwil</Heading>
          <P class="text-gray-500 dark:text-gray-400 italic">Analisis data gabungan seluruh Bapas secara live.</P>
        </div>
        <div class="flex items-center space-x-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
          <div class="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
          <p class="text-sm font-mono text-gray-900 dark:text-white tracking-tighter">
            {currentTime.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} | {currentTime.toLocaleTimeString('en-GB')}
          </p>
        </div>
      </header>

      {#if loading}
        <div class="flex justify-center items-center h-[calc(100vh-10rem)]">
          <Spinner size="10" color="blue" />
          <span class="ml-4 text-lg text-gray-600 dark:text-gray-300">Menggabungkan data dari 7 Bapas...</span>
        </div>
      {:else if error}
        <p class="text-red-500 text-center p-10 bg-red-50 rounded-lg">{error}</p>
      {:else}
        <!-- Baris 1: Kartu Statistik Utama -->
        <section class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          <Card class="p-4 border-l-4 border-blue-500"><h5 class="text-sm font-semibold text-blue-800">Total Klien Dewasa</h5><p class="text-4xl font-extrabold text-blue-900">{stats.jumlahKlienDewasa}</p></Card>
          <Card class="p-4 border-l-4 border-green-500"><h5 class="text-sm font-semibold text-green-800">Total HMB Bulan Ini</h5><p class="text-4xl font-extrabold text-green-900">{stats.jumlahHMBBulanIni}</p></Card>
          <Card class="p-4 border-l-4 border-emerald-500"><h5 class="text-sm font-semibold text-emerald-800">Total HMB Tahun Ini</h5><p class="text-4xl font-extrabold text-emerald-900">{stats.jumlahHMBTahunIni}</p></Card>
          <Card class="p-4 border-l-4 border-purple-500"><h5 class="text-sm font-semibold text-purple-800">Total Klien Baru Thn. Ini</h5><p class="text-4xl font-extrabold text-purple-900">{stats.jumlahKlienBaruTahunIni}</p></Card>
          <Card class="p-4 border-l-4 border-pink-500"><h5 class="text-sm font-semibold text-pink-800">Total Klien Baru Bln. Ini</h5><p class="text-4xl font-extrabold text-pink-900">{stats.jumlahKlienBaruBulanIni}</p></Card>
        </section>
        
        <!-- Baris 2: Status Koneksi Bapas -->
        <section class="mb-6">
          <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Status Koneksi Bapas</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {#each bapasStatus as bapas}
              <div class="p-4 rounded-lg text-center shadow-md"
                  class:bg-green-100={bapas.status === 'Online'}
                  class:dark:bg-green-900={bapas.status === 'Online'}
                  class:bg-red-100={bapas.status === 'Offline'}
                  class:dark:bg-red-900={bapas.status === 'Offline'}
                  class:bg-gray-100={bapas.status === 'Loading'}
                  class:dark:bg-gray-700={bapas.status === 'Loading'}>
                <p class="font-semibold text-gray-800 dark:text-gray-100 truncate">{bapas.name.replace('Bapas Kelas I ', '').replace('Bapas Kelas II ', '')}</p>
                {#if bapas.status === 'Loading'}
                    <Spinner size="4" color="gray" class="mx-auto mt-1"/>
                {:else}
                    <Badge color={bapas.status === 'Online' ? 'green' : 'red'} class="mt-1">{bapas.status}</Badge>
                {/if}
              </div>
            {/each}
          </div>
        </section>
        
        <!-- Baris 3: Grid untuk 2 Grafik Utama -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div class="bg-white p-4 rounded-xl shadow-md"><div class="h-80"><canvas bind:this={lineCanvas}></canvas></div></div>
          <div class="bg-white p-4 rounded-xl shadow-md"><div class="h-80"><canvas bind:this={dailyReportsCanvas}></canvas></div></div>
        </section>
        
        <!-- Baris 4: Peta dan Panel Kanan -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 bg-white p-4 rounded-xl shadow-md">
            <div class="flex flex-wrap justify-between items-center mb-4 gap-2">
                <h3 class="text-lg font-bold text-gray-700">Peta Wajib Lapor Gabungan Bulanan</h3>
                <!-- --- PERUBAHAN: Mengganti Datepicker dengan Dropdown Bulan & Tahun --- -->
                <div class="flex gap-2">
                  <select bind:value={selectedMonth} on:change={handleMonthYearChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="0">Januari</option>
                    <option value="1">Februari</option>
                    <option value="2">Maret</option>
                    <option value="3">April</option>
                    <option value="4">Mei</option>
                    <option value="5">Juni</option>
                    <option value="6">Juli</option>
                    <option value="7">Agustus</option>
                    <option value="8">September</option>
                    <option value="9">Oktober</option>
                    <option value="10">November</option>
                    <option value="11">Desember</option>
                  </select>
                  <select bind:value={selectedYear} on:change={handleMonthYearChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    {#each availableYears as year}
                      <option value={year}>{year}</option>
                    {/each}
                  </select>
                </div>
            </div>
            <div id="map" class="h-96 lg:h-[32rem] rounded-lg z-0"></div>
          </div>

          <div class="flex flex-col gap-6">
            <div class="bg-white p-4 rounded-xl shadow-md flex-1">
              <div class="h-64"><canvas bind:this={monthlyTrendsCanvas}></canvas></div>
            </div>
            <div class="bg-white p-4 rounded-xl shadow-md">
              <h3 class="text-lg font-bold text-gray-700 mb-3">Aktivitas Terbaru (Gabungan)</h3>
              <div class="space-y-2 max-h-48 overflow-y-auto pr-2">
                {#if aktivitasTerbaru.length === 0}
                  <p class="text-sm text-gray-500 italic">Belum ada aktivitas terbaru...</p>
                {/if}
                {#each aktivitasTerbaru as item (item.waktu + item.nama)}
                  <div class="flex justify-between items-center text-sm p-2 rounded-lg hover:bg-gray-50">
                    <span class="font-semibold text-gray-800 truncate" title={item.nama}>{item.nama}</span>
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <span class="text-xs font-mono text-gray-500">{item.waktu}</span>
                      <Badge color="blue">{item.jenis}</Badge>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </section>
      {/if}

    </section>
    
    <!-- SECTION 4: PENJELASAN -->
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
/* Optional: Style for the legend */
.leaflet-control.legend {
    line-height: 1.4;
}
</style>