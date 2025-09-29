<script>
    import { navigate } from 'svelte-routing'; // Import navigate for routing

    function goToListKlien() {
        navigate('/list-klien'); // Navigate to the upload data page
    }
</script>

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

<div class="dashboard">
    <h1>Petugas Dashboard</h1>
    <p>Welcome, Petugas! Here you can manage your tasks.</p>
    <button class="button" on:click={goToListKlien}>List Klien</button>
    <!-- Additional content and features for Petugas -->
</div>
