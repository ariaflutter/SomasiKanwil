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
    { name: 'Bapas Jember', url: 'https://bapasjember.aksara.cloud' },
    { name: 'Bapas Surabaya', url: 'https://bapassurabaya.aksara.cloud' },
    { name: 'Bapas Malang', url: 'https://bapasmalang.aksara.cloud' },
    { name: 'Bapas Madiun', url: 'https://bapasmadiun.aksara.cloud' },
    { name: 'Bapas Bojonegoro', url: 'https://bapasbojonegoro.aksara.cloud' },
    { name: 'Bapas Kediri', url: 'https://bapaskediri.aksara.cloud' },
    { name: 'Bapas Pamekasan', url: 'https://bapaspamekasan.aksara.cloud' },
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
    <!-- SECTION 1: DASHBOARD - Now showing first -->
    
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
    
    <!-- SECTION 2: HERO IMAGE - Now moved after dashboard -->
    <section
      id="hero"
      class="h-[90vh] w-full relative flex items-center justify-center snap-start overflow-hidden"
    >
      <!-- Background dengan pattern aksara Indonesia -->
      <div
        class="absolute inset-0 bg-cover bg-center z-0 transform scale-110"
        style="background-image: url('https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D3D&auto=format&fit=crop&w=2070&q=80');"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-900/90 to-purple-900/95"></div>
        <!-- Pattern aksara overlay -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute inset-0" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINGg0SDB2Mmg0djRoMnYtNGg0djJINHp6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINGg2eiIvPjwvZz48L2c+PC9zdmc+');"></div>
        </div>
      </div>

      <!-- Dekorasi aksara Indonesia kiri -->
      <div class="absolute left-0 top-0 h-full w-32 md:w-64 flex items-center justify-center opacity-20">
        <div class="text-white text-6xl md:text-8xl font-bold transform rotate-180 writing-mode-vertical">ᬓᬘᬓᬓᬭ</div>
      </div>
      
      <!-- Dekorasi aksara Indonesia kanan -->
      <div class="absolute right-0 top-0 h-full w-32 md:w-64 flex items-center justify-center opacity-20">
        <div class="text-white text-6xl md:text-8xl font-bold writing-mode-vertical">ᬓᬘᬓᬓᬭ</div>
      </div>

      <div class="relative z-10 text-center text-white px-4 max-w-6xl mx-auto">
        <div class="animate-fade-in-up">
          <!-- Logo Aksara dengan animasi -->
          <div class="mb-6 flex justify-center">
            <div class="relative">
              <div class="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <img src="../Logo.png" class="relative h-20 md:h-32 animate-bounce" alt="Aksara Logo" />
            </div>
          </div>
          
          <Heading
            tag="h1"
            class="mb-6"
            customSize="text-4xl md:text-5xl lg:text-7xl xl:text-8xl"
          >
            <Span class="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-400 drop-shadow-lg">
              ᬅᬓ᭄ᬱᬭ
            </Span>
            <br>
            <Span class="text-gray-100 font-bold text-2xl md:text-3xl lg:text-4xl xl:text-5xl">AKSARA</Span>
            <br>
            <Span class="text-gray-200 font-light text-xl md:text-2xl lg:text-3xl xl:text-4xl">Aplikasi Kendali Klien Pemasyarakatan</Span>
            <br>
            <Span class="text-yellow-300 text-lg md:text-xl lg:text-2xl xl:text-3xl font-medium mt-4 inline-block px-6 py-2 bg-white/10 rounded-full backdrop-blur-sm">{instanceName}</Span>
          </Heading>
          
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            <P class="text-lg md:text-xl font-light text-gray-200 max-w-3xl text-center">
              Platform digital terintegrasi dengan sentuhan budaya Indonesia untuk pengawasan dan kendali klien pemasyarakatan yang modern, akuntabel, dan efisien.
            </P>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8">
            <GradientButton color="pinkToOrange" href="/tentang" class="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Pelajari Lebih Lanjut
              </span>
              <ArrowRightOutline class="w-5 h-5 ms-2" />
            </GradientButton>
            
            <GradientButton color="purpleToBlue" href="/tutorial" class="shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 px-8 py-4 text-lg">
              <span class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tutorial
              </span>
            </GradientButton>
          </div>
          
          <!-- Statistik singkat -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div class="text-2xl md:text-3xl font-bold text-yellow-300">{BAPAS_LIST.length}</div>
              <div class="text-sm text-gray-200">Bapas Terhubung</div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div class="text-2xl md:text-3xl font-bold text-green-300">{stats.jumlahKlienDewasa || 0}</div>
              <div class="text-sm text-gray-200">Klien Aktif</div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div class="text-2xl md:text-3xl font-bold text-blue-300">{stats.jumlahHMBBulanIni || 0}</div>
              <div class="text-sm text-gray-200">Laporan Bulan Ini</div>
            </div>
            <div class="bg-white/10 backdrop-blur-md rounded-lg p-4">
              <div class="text-2xl md:text-3xl font-bold text-purple-300">24/7</div>
              <div class="text-sm text-gray-200">Layanan Online</div>
            </div>
          </div>
        </div>
      </div>

      <button
        on:click={() => scrollTo('#berita')}
        class="absolute bottom-10 z-10 text-white animate-bounce bg-white/10 backdrop-blur-sm p-4 rounded-full hover:bg-white/20 transition-all duration-300"
        aria-label="Scroll ke bagian berita"
      >
        <ChevronDownOutline size="xl" />
      </button>
    </section>

    <!-- SECTION 3: BAPAS LIST -->
    <section
      id="berita"
      class="w-full bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-orange-900/20 dark:to-red-900/20 flex flex-col items-center justify-center snap-start p-4 pt-16 pb-16 relative overflow-hidden"
    >
      <!-- Background pattern dengan aksara -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzR2LTRoLTJ2NGgtNHYyaDR2NGgydi00aDR2LTJoLTR6bTAtMzBWMGgtMnY0aC00djJoNHY0aDJWNmg0VjRoLTR6TTYgMzR2LTRINGg0SDB2Mmg0djRoMnYtNGg0djJINHp6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINGg2eiIvPjwvZz48L2c+PC9zdmc+');"></div>
      </div>
      
      <!-- Dekorasi aksara di kiri dan kanan -->
      <div class="absolute left-0 top-1/4 text-8xl md:text-9xl text-orange-200/20 transform -rotate-12">ᬓᬘᬓ</div>
      <div class="absolute right-0 top-1/4 text-8xl md:text-9xl text-red-200/20 transform rotate-12">ᬓᬓᬭ</div>
      
      <div class="container text-center max-w-screen-xl h-full flex flex-col relative z-10">
        <div class="mb-12">
          <h2 class="text-4xl md:text-5xl font-bold pb-4 text-gray-900 dark:text-white mb-4">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500">
              ᬅᬓ᭄ᬱᬭ ᬩᬧᬲ᭄
            </span>
            <br>
            <span class="text-3xl md:text-4xl text-gray-800 dark:text-gray-200">Aksara Bapas Jawa Timur</span>
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Jelajahi implementasi Aksara di seluruh Balai Pemasyarakatan se-Jawa Timur dengan sentuhan budaya Indonesia untuk layanan pemasyarakatan yang lebih terintegrasi dan modern.
          </p>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full">
          <a href="https://bapasjember.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/30 dark:hover:to-indigo-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-blue-200/30">ᬚ᭄ᬫᬃ</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Jember</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapassurabaya.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800/30 dark:hover:to-pink-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-purple-200/30">ᬲᬸᬃᬩᬾ</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Surabaya</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapasmalang.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800/30 dark:hover:to-emerald-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-green-200/30">ᬫᬮᬂ</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Malang</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapasmadiun.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-800/30 dark:hover:to-orange-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-yellow-200/30">ᬫᬤᬶᬬᬦ᭄</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Madiun</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapasbojonegoro.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 hover:from-red-100 hover:to-rose-100 dark:hover:from-red-800/30 dark:hover:to-rose-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-red-200/30">ᬩᭀᬚᭀᬦᬕᬋ</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Bojonegoro</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapaskediri.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-800/30 dark:hover:to-blue-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-indigo-200/30">ᬓᭂᬤᬶᬭᬶ</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Kediri</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
          
          <a href="https://bapaspamekasan.aksara.cloud" target="_blank" class="group aksara-card p-8 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 hover:from-teal-100 hover:to-cyan-100 dark:hover:from-teal-800/30 dark:hover:to-cyan-800/30 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden">
            <div class="absolute top-2 right-2 text-4xl text-teal-200/30">ᬧᬫᬾᬓᬲᬦ᭄</div>
            <div class="flex flex-col items-center relative z-10">
              <div class="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bapas Pamekasan</h3>
              <p class="text-gray-600 dark:text-gray-400">Kunjungi website</p>
              <div class="mt-2 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </div>
            </div>
          </a>
        </div>
        
        <!-- Statistik Bapas -->
        <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400">{BAPAS_LIST.length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Total Bapas</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-red-600 dark:text-red-400">{bapasStatus.filter(b => b.status === 'Online').length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Online</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-yellow-600 dark:text-yellow-400">{bapasStatus.filter(b => b.status === 'Offline').length}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Offline</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-bold text-green-600 dark:text-green-400">24/7</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">Layanan</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- SECTION 4: PENJELASAN -->
    <section
      id="penjelasan"
      class="h-full w-full bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center snap-start text-center p-8 md:p-16"
    >
      <div class="max-w-screen-lg animate-fade-in-up">
        <div class="text-center mb-12">
          <Heading
            tag="h2"
            class="mb-6"
            customSize="text-3xl md:text-4xl lg:text-5xl xl:text-6xl text-gray-900 dark:text-white"
          >
            Apa itu
            <Span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400">
              Aksara?
            </Span>
          </Heading>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div class="text-left">
            <P class="text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed">
              Aksara adalah <Span class="font-semibold text-blue-600 dark:text-blue-400">Aplikasi Kendali dan Supervisi Klien Pemasyarakatan</Span> - sebuah platform digital terpadu yang dirancang untuk mendukung reformasi birokrasi dan meningkatkan transparansi layanan di seluruh Balai Pemasyarakatan di Jawa Timur.
            </P>
            <P class="text-gray-600 dark:text-gray-300 md:text-lg leading-relaxed mt-4">
              Sistem ini memberikan akses mudah terhadap informasi, program, dan data secara real-time untuk mendukung tata kelola pemasyarakatan yang modern dan akuntabel.
            </P>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="aksara-card p-6 text-center">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Real-time</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Data aktual dan terkini</p>
            </div>
            
            <div class="aksara-card p-6 text-center">
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Aman</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Keamanan data terjamin</p>
            </div>
            
            <div class="aksara-card p-6 text-center">
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Cepat</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Akses cepat dan responsif</p>
            </div>
            
            <div class="aksara-card p-6 text-center">
              <div class="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-2">Terintegrasi</h4>
              <p class="text-sm text-gray-600 dark:text-gray-400">Sistem terpadu lengkap</p>
            </div>
          </div>
        </div>
        
        <div class="text-center">
          <GradientButton color="cyanToBlue" href="/tentang" class="px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
            Pelajari Lebih Lanjut
            <ArrowRightOutline class="w-5 h-5 ms-2" />
          </GradientButton>
        </div>
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