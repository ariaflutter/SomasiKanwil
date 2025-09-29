<script>
    import { navigate } from 'svelte-routing'; // Import navigate for routing
    import WajibLaporToday from './WajibLaporToday.svelte';
    import LokasiWajibLapor from './LokasiWajibLapor.svelte';
    import Sidebar from './Sidebar.svelte';
    import TopNav from './TopNav.svelte';

    function goToUploadData() {
        navigate('/upload-data'); // Navigate to the upload data page
    }
    function goToListKlien() {
        navigate('/list-klien'); // Navigate to the upload data page
    }

    function goToWajibLaporHariIni() {
        navigate('/wajib-lapor-today'); // Navigate to the upload data page
    }
    function goToLokasiWajibLapor() {
        navigate('/lokasi-wajib-lapor'); // Navigate to the upload data page
    }
    function goToShow() {
        navigate('/show'); // Navigate to the upload data page
    }
</script>
<Sidebar />


<button class="button" on:click={goToUploadData}>Upload Data</button>
<!-- 
<style>
    .dashboard {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background-color: #f0f2f5;
    }

    .button {
        padding: 10px 20px;
        margin-top: 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
</style>
<Sidebar />

<div class="dashboard">
    <h1>Petugas Dashboard</h1>
    <p>Welcome, Petugas! Here you can manage your tasks.</p>
    <button class="button" on:click={goToUploadData}>Upload Data</button>
    <button class="button" on:click={goToListKlien}>List Klien</button>
    <button class="button" on:click={goToWajibLaporHariIni}>Wajib Lapor Hari Ini</button>
    <button class="button" on:click={goToLokasiWajibLapor}>Lokasi Wajib Lapor</button>
    <button class="button" on:click={goToShow}>Show</button>

</div> -->
