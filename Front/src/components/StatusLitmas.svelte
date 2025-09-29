<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";
  import Footerku from "./footerku.svelte";
  import { Search, Button } from "flowbite-svelte";
  import { SearchOutline } from "flowbite-svelte-icons";
  import {
    Heading,
    P,
    A,
    Mark,
    Secondary,
    GradientButton,
    Span,
    Hr,
    Footer,
    FooterBrand,
    FooterLinkGroup,
    FooterLink,
    FooterCopyright,
    FooterIcon,
  } from "flowbite-svelte";
  import { ArrowRightOutline } from "flowbite-svelte-icons";
  import { Badge } from "flowbite-svelte";
  const apiUrl = import.meta.env.VITE_API_URL;
  let searchQuery = ""; // To hold the user's search input
  let results = []; // To store the fetched results
  let isLoading = false; // To show loading state
  let errorMessage = ""; // To show error messages

  // Function to fetch data based on the search query
  async function fetchData() {
    if (!searchQuery) {
      return; // Exit if no search query
    }

    isLoading = true; // Start loading
    errorMessage = ""; // Reset any previous error messages

    try {
      const response = await fetch(
        `/api/search?nama=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      results = await response.json(); // Store the results
    } catch (error) {
      errorMessage = error.message; // Capture error message
      console.error("Error fetching data:", error);
    } finally {
      isLoading = false; // End loading
    }
  }

  // Function to convert Excel date code to a readable date string
  function excelDateToString(excelDate) {
    if (!excelDate) return ""; // Return empty if no date
    const date = new Date((excelDate - 25569) * 86400 * 1000); // Convert to milliseconds
    return date.toLocaleDateString(); // Format date as a string
  }

  // Function to determine the status color
  function getStatusColor(status) {
    return status === "☒" ? "red" : status === "☑" ? "green" : "black";
  }

  // Function to determine the badge content and styles
  function getBadgeContent(status) {
    switch (status) {
      case "☑":
        return { text: "Litmas Sudah Terselesaikan", color: "success" };
      case "☒":
        return { text: "Litmas Belum Terselesaikan", color: "danger" };
      default:
        return { text: "Unknown", color: "gray" };
    }
  }
</script>

<Nav />
<h2
  class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white pt-8"
>
  Pencarian Status Litmas
</h2>
<div class="flex justify-center mb-8 max-w-screen-xl">
  <form
    class="flex gap-2 justify-center min-w-96"
    on:submit|preventDefault={fetchData}
  >
    <Search
      size="md"
      placeholder="Ketik nama klien disini"
      bind:value={searchQuery}
      class="w-full max-w-md"
    />
    <Button class="!p-2.5" on:click={fetchData}>
      <SearchOutline class="w-6 h-3" />
    </Button>
  </form>
</div>
<div class="flex-1 overflow-y-auto p-4 mb-24 max-w-screen-xl">
  {#if isLoading}
    <p class="text-center text-gray-500">Tunggu Sebentar...</p>
  {:else if errorMessage}
    <p class="text-center text-red-500">{errorMessage}</p>
  {:else if results.length > 0}
    <!-- Responsive Results -->
    <div class="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
      {#each results as result (result._id)}
        <div
          class="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
        >
          <!-- Wajib Lapor -->

          <!-- Details -->
          <div class="flex items-center gap-4 mb-4">
            <span>{result.name}</span>
            <span
              class={`px-2 py-1 rounded-full text-sm font-semibold flex justify-center ${
                result.LitmasTerselesaikan === "☑"
                  ? "bg-green-100 text-green-800"
                  : result.LitmasTerselesaikan === "☒"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
              }`}
            >
              {result.LitmasTerselesaikan === "☑"
                ? "Litmas Terselesaikan"
                : result.LitmasTerselesaikan === "☒"
                  ? "Litmas Belum Terselesaikan"
                  : "Cek Data, Ada Kesalahan"}
            </span>
          </div>
          <p><strong>Nama:</strong> {result.Nama}</p>
          <p><strong>Status Litmas:</strong> {result.LitmasTerselesaikan}</p>
          <p><strong>Nama Penjamin:</strong> {result.NamaPenjamin}</p>
          <p>
            <strong>Tanggal Penyelesaian Litmas</strong>
            {result.TanggalPenyelesaianLitmas === "0"
              ? "-"
              : new Date(
                  (result.TanggalPenyelesaianLitmas - 25569) * 86400 * 1000
                ).toLocaleDateString("id-ID", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
          </p>
          <p>
            <strong>Asal Lapas / Peminta Litmas:</strong>
            {result.NamaLapas}
          </p>
        </div>
      {/each}
    </div>
  {:else}
    <p class="text-center text-gray-500">
      Nama Tidak Ditemukan / Anda Belum Mencari
    </p>
  {/if}
</div>

<!-- <div>
    <h1>Pencarian Status Litmas</h1>
    

    {#if isLoading}
        <p class="loading">Tunggu Sebentar...</p>
    {:else if errorMessage}
        <p class="error">{errorMessage}</p>
    {:else if results.length > 0}
        <table class="table">
            <thead>
                <tr>
                    <th>Nama</th>
                    <th>Status Litmas</th>
                    <th>Nama Penjamin</th>
                    <th>Tanggal Penyelesaian Litmas</th>
                    <th>Asal Permintaan Litmas</th>
                </tr>
            </thead>
            <tbody>
                {#each results as result}
                    <tr>
                        <td style="color: {getStatusColor(result.LitmasTerselesaikan)};">{result.Nama}</td>
                        <td style="color: {getStatusColor(result.LitmasTerselesaikan)};">
                            {result.LitmasTerselesaikan}
                        </td>
                        <td style="color: {getStatusColor(result.LitmasTerselesaikan)};">{result.NamaPenjamin === '0'
                            ? '-'
                            : result.NamaPenjamin}</td>
                        <td style="color: {getStatusColor(result.LitmasTerselesaikan)};">{result.TanggalPenyelesaianLitmas === '0' 
                            ? '-' 
                            : new Date((result.TanggalPenyelesaianLitmas - 25569) * 86400 * 1000).toLocaleDateString('id-ID', {
                                year: 'numeric', month: 'long', day: 'numeric'
                            })
                        }</td>
                        <td style="color: {getStatusColor(result.LitmasTerselesaikan)};">{result.InstansiPemintaLitmas}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {:else}
        <p>Nama Tidak Ditemukan / Anda Belum Mencari</p>
    {/if}
</div> -->

<BotNav />
