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
  let showMapControls = false; // Add this line
  let error = "";
  let connectionStatus = "Menyambungkan...";
  let lastNotification: any = null;
  let currentTime = new Date();
  let timer: NodeJS.Timeout;
  let bapasStatus: { name: string, status: 'Online' | 'Offline' | 'Loading' }[] = BAPAS_LIST.map(b => ({ name: b.name, status: 'Loading' }));
  let autoScroll = false;

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
        // Initialize map with full viewport height
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
    }, 500); // Increased timeout to ensure DOM is fully rendered
    
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
  
  <!-- Vertical Scroll Indicators - Fixed Position -->
  

  <!-- Container Utama dengan snap scrolling -->
  <main class="flex-grow overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory">
    
    <!-- SECTION 1: MAP & KAKANWIL -->
    <section id="map-section" class="h-full w-full snap-start relative p-2">
      {#if lastNotification}
        <div class="fixed top-20 right-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-5 py-3 rounded-xl shadow-lg z-[1000] animate-bounce">
          <p class="font-bold">📢 Laporan Baru dari {lastNotification.namaBapas}!</p>
          <p class="text-sm">{lastNotification.Nama} baru saja melapor.</p>
        </div>
      {/if}

      <!-- TOGGLEABLE MAP CONTROLS -->
      <div class="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <button 
          on:click={() => showMapControls = !showMapControls}
          class="bg-blue-600 text-white p-3 rounded-full shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center border-2 border-white"
        >
          {#if showMapControls}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          {:else}
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          {/if}
        </button>

        {#if showMapControls}
          <div class="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl w-64 border border-blue-100 animate-fade-in-up">
            <h3 class="text-sm font-black text-blue-900 uppercase tracking-tighter mb-3">Map Filters</h3>
            <div class="flex flex-col gap-2">
              <select bind:value={selectedMonth} on:change={handleMonthYearChange} class="bg-slate-50 border-none text-sm rounded-xl focus:ring-2 focus:ring-blue-500">
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
              <select bind:value={selectedYear} on:change={handleMonthYearChange} class="bg-slate-50 border-none text-sm rounded-xl focus:ring-2 focus:ring-blue-500">
                {#each availableYears as year}
                  <option value={year}>{year}</option>
                {/each}
              </select>
            </div>
          </div>
        {/if}
      </div>

      <div class="flex flex-col-reverse lg:flex-row h-full w-full">
        <!-- MAP -->
        <div id="map" class="h-[65%] lg:h-full lg:w-3/5 z-0"></div>
        
        <!-- KAKANWIL BLUE THEME -->
        <div id="test" class="h-screen lg:h-full lg:w-2/5 z-0 border-b lg:border-b-0 lg:border-l border-white/10 relative">
          <div class="h-full relative overflow-hidden bg-blue-950">
            <div class="absolute inset-0">
              <img src="/Kakanwil.png" alt="Kakanwil" class="w-full h-full object-cover object-top scale-110 lg:scale-125 -translate-y-4 lg:-translate-y-12 opacity-90" />
              <div class="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-950/40 to-transparent"></div>
            </div>
              
            <div class="relative h-full flex flex-col justify-end p-4 lg:p-8 text-white">
              <div class="mb-2 lg:mb-10 transform -skew-x-12 z-10">
                <h2 class="text-3xl lg:text-3xl font-black italic tracking-tighter leading-[0.8] mb-0 text-white">
                  AKSA<span class="text-yellow-400">RA</span>
                </h2>
                <h3 class="text-[10px] lg:text-lg font-bold tracking-[0.15em] uppercase text-blue-200 mt-1">Aplikasi Kendali dan Supervisi Klien Pemasayrakatan</h3>
              </div>

              <div class="grid grid-cols-1 mb-4 lg:mb-6 relative z-10">
                <div class="bg-blue-900/40 backdrop-blur-xl p-3 lg:p-5 border-l-4 lg:border-l-8 border-yellow-400 rounded-r-xl">
                  <p class="text-[10px] lg:text-sm font-bold uppercase italic text-white leading-tight">
                    "Pushing the limits of <span class="text-yellow-400">Digital Governance</span>."
                  </p>
                </div>
              </div>

              <div class="flex items-end justify-between border-t border-white/20 pt-3 lg:pt-6">
                <div class="flex gap-4">
                  <div>
                    <p class="text-[8px] lg:text-[10px] text-blue-400 font-black uppercase">Nodes</p>
                    <p class="text-xs lg:text-sm font-black italic text-white">ACTIVE</p>
                  </div>
                </div>
                <div class="text-right leading-none opacity-20">
                  <p class="text-sm lg:text-2xl font-black text-white italic">JAWA TIMUR</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: HORIZONTAL SCROLL CONTENT - RESPONSIVE OPTIMIZED -->
    <section id="aksara-section" class="h-full w-full snap-start overflow-hidden">
      <div class="h-full w-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth" id="horizontal-scroll" on:mouseenter={() => autoScroll = false} on:mouseleave={() => autoScroll = true}>
        
        <!-- SLIDE 1: HERO (SHRUNK FOR MOBILE) -->
        <div class="min-w-full h-full snap-center flex-shrink-0 relative bg-blue-950 overflow-hidden">
          <div class="absolute inset-0 opacity-10">
            <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center"></div>
          </div>
          <div class="relative z-10 h-full flex flex-col justify-center items-center px-4">
            <!-- Shrunk Watermark -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none">
              <h2 class="text-[8rem] lg:text-[25rem] font-black italic tracking-tighter text-white">AKSR</h2>
            </div>
            
            <div class="text-center transform -skew-x-6">
              <img src="/Logo.png" class="h-12 lg:h-20 mx-auto mb-4" alt="Logo" />
              <h1 class="text-5xl lg:text-9xl font-black italic tracking-tighter text-white leading-none">
                AK<span class="text-yellow-400">SARA</span>
              </h1>
              <p class="text-[10px] lg:text-2xl font-bold tracking-[0.2em] uppercase text-cyan-400 mb-6">High Performance Control</p>
              
              <div class="flex flex-col md:flex-row gap-3 justify-center">
                <button on:click={() => scrollTo('#dashboard-section')} class="px-6 py-3 bg-yellow-400 text-blue-950 font-black italic text-xs lg:text-xl uppercase transform skew-x-[-12deg]">Launch Analytics</button>
              </div>
            </div>

            <!-- Stats grid: Better mobile fit -->
            <div class="absolute bottom-10 w-full max-w-lg grid grid-cols-2 gap-1 px-4">
              {#each [{l: 'Nodes', v: BAPAS_LIST.length}, {l: 'Clients', v: stats.jumlahKlienDewasa || 0}] as stat}
                <div class="bg-blue-900/50 backdrop-blur-md p-3 border-l-2 border-cyan-500">
                  <p class="text-[8px] font-black uppercase text-cyan-400">{stat.l}</p>
                  <p class="text-sm font-black text-white italic">{stat.v}</p>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- SLIDE 2: REGIONAL NODES (SPONSOR/LOGO WALL STYLE) -->
        <div class="min-w-full h-full snap-center flex-shrink-0 bg-slate-950 p-4 lg:p-8 flex flex-col justify-start relative overflow-hidden">
          
          <!-- TOP LOGO STRIP (Racing Sponsor Style) -->
          <div class="w-full pt-2 pb-6 lg:pb-10 border-b border-white/5">
            <div class="max-w-7xl mx-auto">
              <p class="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center mb-4 lg:mb-6">Integrated Network Partners</p>
              
              <!-- Logos Container: Flex wrap for mobile, single row for desktop -->
              <div class="flex flex-wrap lg:flex-nowrap items-center justify-center gap-4 lg:gap-12 opacity-100 brightness-100">
                {#each ['lg1', 'lg2', 'lg3', 'lg4', 'lg5', 'lg6', 'lg7'] as logo}
                  <img 
                    src="/{logo}.png" 
                    alt="Network Logo {logo}" 
                    class="h-6 lg:h-10 w-auto object-contain hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
                  />
                {/each}
              </div>
            </div>
          </div>

          <!-- MAIN CONTENT LAYER -->
          <div class="w-full max-w-7xl mx-auto mt-6 lg:mt-10 relative z-10 flex-grow">
            <div class="mb-4 lg:mb-12 flex items-end justify-between border-b-2 lg:border-b-4 border-blue-600 pb-2 lg:pb-4">
              <div class="transform -skew-x-12">
                <h2 class="text-3xl lg:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                  Regional <span class="text-yellow-400">Nodes</span>
                </h2>
                <div class="flex items-center gap-2 mt-1">
                    <div class="h-[2px] w-6 bg-blue-500"></div>
                    <p class="text-[10px] lg:text-lg font-bold text-slate-400 tracking-[0.2em] uppercase">Uptime Monitor: 99.9%</p>
                </div>
              </div>
              <div class="text-right hidden md:block">
                <p class="text-4xl font-black text-white/5">STATION_MAP</p>
              </div>
            </div>

            <!-- GRID: High-Contrast Tactical Cards -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 overflow-y-auto max-h-[50vh] lg:max-h-none pr-2">
              {#each BAPAS_LIST as bapas}
                <a 
                  href={bapas.url} 
                  target="_blank" 
                  class="group relative bg-blue-900/10 backdrop-blur-md p-3 lg:p-6 border border-white/5 hover:border-yellow-400 hover:bg-blue-600/20 transition-all duration-300 transform -skew-x-6"
                >
                  <!-- Tactical Corner Accent -->
                  <div class="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-500 group-hover:border-yellow-400"></div>
                  
                  <div class="transform skew-x-6"> <!-- Un-skewing content for legibility -->
                    <div class="flex justify-between items-center mb-1">
                      <p class="text-[8px] lg:text-[10px] font-black text-blue-500 group-hover:text-yellow-400 uppercase">Station</p>
                      <div class="h-1 w-1 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <h3 class="text-[10px] lg:text-2xl font-black italic uppercase text-white group-hover:text-yellow-400 transition-colors">
                      {bapas.name.replace('Bapas ', '')}
                    </h3>
                  </div>
                </a>
              {/each}
            </div>
          </div>

          <!-- Large Watermark for background energy -->
          <div class="absolute -bottom-10 -left-10 text-[12rem] font-black italic text-white/[0.02] select-none pointer-events-none">
            NETWORK
          </div>
        </div>

        <!-- SLIDE 3: DIRECTIVE (SHRUNK TYPOGRAPHY) -->
        <!-- SLIDE 3: THE CORE (TACTICAL OVERHAUL) -->
        <div class="w-full h-full snap-center flex-shrink-0 bg-slate-950 relative overflow-hidden flex items-center justify-center">
          
          <!-- Background: High-Tech Grid & Glow -->
          <div class="absolute inset-0 opacity-20">
            <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0); background-size: 24px 24px;"></div>
            <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-red-600/10"></div>
          </div>

          <!-- Content Wrapper: Skewed & Forced Width -->
          <div class="relative z-10 w-full max-w-full px-5 py-10 flex flex-col gap-8">
            
            <!-- Headline: Massive & Outlined -->
            <div class="relative">
              <div class="absolute -top-6 -left-2 opacity-10 select-none">
                <span class="text-6xl font-black italic tracking-tighter text-white">SYSTEM</span>
              </div>
              <h2 class="text-6xl lg:text-9xl font-black italic tracking-tighter text-white leading-none transform -skew-x-12">
                THE <span class="text-transparent" style="-webkit-text-stroke: 1px #fbbf24;">CORE</span>
              </h2>
              <div class="flex items-center gap-2 mt-2">
                <div class="h-[2px] w-12 bg-yellow-400"></div>
                <p class="text-[10px] lg:text-xl font-black uppercase tracking-[0.3em] text-cyan-400">Tactical Control Layer</p>
              </div>
            </div>

            <!-- Info Grid: Slanted Tactical Cards -->
            <div class="grid grid-cols-1 gap-3 w-full">
              
              <!-- Card 1 -->
              <div class="relative group transform hover:scale-[1.02] transition-transform">
                <div class="absolute inset-0 bg-blue-600 transform -skew-x-12 translate-x-1"></div>
                <div class="relative bg-blue-950 p-4 border-l-4 border-yellow-400 transform -skew-x-12">
                  <div class="transform skew-x-12"> <!-- Un-skew text so it stays readable -->
                    <div class="flex justify-between items-start">
                      <h4 class="text-xs font-black italic text-yellow-400">REAL-TIME TRACKING</h4>
                      <span class="text-[8px] font-mono text-blue-400">01//SYNC</span>
                    </div>
                    <p class="text-[10px] text-white font-bold leading-tight mt-1 opacity-80 uppercase">
                      Kontrol Lokasi dan Keberadaan Klien Pemasyarakatan Secara Langsung
                    </p>
                  </div>
                </div>
              </div>

              <!-- Card 2 -->
              <div class="relative group transform hover:scale-[1.02] transition-transform">
                <div class="absolute inset-0 bg-red-600 transform -skew-x-12 translate-x-1"></div>
                <div class="relative bg-slate-900 p-4 border-l-4 border-white transform -skew-x-12">
                  <div class="transform skew-x-12">
                    <div class="flex justify-between items-start">
                      <h4 class="text-xs font-black italic text-white">ENCRYPTION SHIELD</h4>
                      <span class="text-[8px] font-mono text-red-500">02//SEC</span>
                    </div>
                    <p class="text-[10px] text-white font-bold leading-tight mt-1 opacity-80 uppercase">
                      Sistem Administrasi Terintegrasi Jaringan Kantor Wilayah Kementerian Imigrasi dan Pemasyarakatan Jawa Timur
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <!-- Bottom Detail: Racing Stripe -->
            <div class="flex items-center justify-between opacity-50">
              <div class="flex gap-1">
                <div class="h-1 w-8 bg-yellow-400"></div>
                <div class="h-1 w-2 bg-red-600"></div>
                <div class="h-1 w-2 bg-white"></div>
              </div>
              <p class="text-[8px] font-black tracking-widest text-slate-500 uppercase">Aksara Backbone v.4.0</p>
            </div>

          </div>
          
          <!-- Large Background Detail -->
          <div class="absolute -bottom-10 -right-10 text-[15rem] font-black italic text-white/[0.03] select-none pointer-events-none">
            AKSR
          </div>

        </div>
      </div>
    </section>

    <!-- SECTION 3: DASHBOARD ANALYTICS (CLEANED UP) -->
    <section id="dashboard-section" class="w-full flex flex-col p-4 lg:p-6 snap-start">
      <header class="flex flex-wrap justify-between items-center mb-6 gap-4 border-b border-slate-200 pb-4">
        <Heading tag="h1" class="text-xl lg:text-2xl font-black uppercase italic text-blue-950">Analytics Center</Heading>
        <div class="bg-slate-100 p-2 rounded-lg"><p class="text-[10px] font-mono">{currentTime.toLocaleTimeString()}</p></div>
      </header>

      {#if loading}
        <div class="flex flex-col items-center justify-center h-64"><Spinner size="8" color="blue" /><p class="mt-4 text-xs font-black uppercase">Intercepting Data...</p></div>
      {:else}
        <!-- Stats -->
        <section class="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-4">
          {#each [{l: 'Total Clients', v: stats.jumlahKlienDewasa, c: 'blue'}, {l: 'HMB Month', v: stats.jumlahHMBBulanIni, c: 'green'}, {l: 'HMB Year', v: stats.jumlahHMBTahunIni, c: 'emerald'}, {l: 'New Year', v: stats.jumlahKlienBaruTahunIni, c: 'purple'}, {l: 'New Month', v: stats.jumlahKlienBaruBulanIni, c: 'pink'}] as card}
            <div class="bg-white p-3 border-l-4 border-{card.c}-500 shadow-sm">
              <h5 class="text-[8px] font-black uppercase text-slate-500">{card.l}</h5>
              <p class="text-xl font-black italic text-slate-900">{card.v}</p>
            </div>
          {/each}
        </section>

        <!-- Charts -->
        <section class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div class="bg-white p-2 rounded-xl shadow-sm h-64"><canvas bind:this={lineCanvas}></canvas></div>
          <div class="bg-white p-2 rounded-xl shadow-sm h-64"><canvas bind:this={dailyReportsCanvas}></canvas></div>
        </section>
      {/if}
    </section>
</main>
</div>

<style>
/* Optional: Style for the legend */
.leaflet-control.legend {
    line-height: 1.4;
}

/* Custom styles for horizontal scrolling */
#horizontal-scroll {
    scroll-behavior: smooth;
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

#horizontal-scroll::-webkit-scrollbar {
    height: 8px;
}

#horizontal-scroll::-webkit-scrollbar-track {
    background: rgba(229, 231, 235, 0.3);
    border-radius: 4px;
}

#horizontal-scroll::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.7);
    border-radius: 4px;
}

#horizontal-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(107, 114, 128, 0.8);
}

/* Writing mode for vertical text */
.writing-mode-vertical {
    writing-mode: vertical-rl;
    text-orientation: upright;
}

/* Animation for fade in up */
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 1s ease-out;
}

/* Custom styles for Bapas cards to ensure consistent sizing */
.aksara-card {
    min-height: 16rem; /* h-64 equivalent */
    display: flex;
    flex-direction: column;
}
</style>