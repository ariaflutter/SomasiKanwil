<script>
  // @ts-nocheck
  import { navigate } from "svelte-routing";

  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";
  import Footerku from "./footerku.svelte";
  import { onMount } from "svelte";
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
  3;
  import { Modal } from "flowbite-svelte";
  const apiUrl = import.meta.env.VITE_API_URL;
  let defaultModal = false;

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
      console.log("Fetched Results:", results);
    } catch (error) {
      errorMessage = error.message; // Capture error message
      console.error("Error fetching data:", error);
    } finally {
      isLoading = false; // End loading
    }
  }

  // Function to determine the status color
  function getStatusColor(status) {
    return status === "☒"
      ? "text-red-600"
      : status === "☑"
        ? "text-green-600"
        : "text-black";
  }

  // Function to navigate to the detail page
  function navigateToDetail(id) {
    navigate(`/wajib-lapor/${id}`); // Navigate to the detail page with the specific ID
  }

  onMount(async () => {
    defaultModal = true;
  });
</script>


<Nav />

<h2
  class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white pt-8"
>
  Form Wajib Lapor
</h2>
<div class="flex justify-center mb-8 max-w-screen-xl w-screen">
  <form
    class="flex gap-2 justify-center min-w-80"
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

<div class="flex-1 overflow-y-auto p-8 mb-24 max-w-screen-xl">
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
          <div class={`py-2 ${getStatusColor(result.LitmasTerselesaikan)}`}>
            {#if result.WajibLapor === "Ya"}
              <button
                class="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-900"
                on:click={() => navigateToDetail(result._id)}
              >
                Klik
              </button>
            {:else}
              <p class="text-sm text-red-500">
                Anda tidak berhak Wajib Lapor Online<br />
                Hubungi PK Anda
              </p>
            {/if}
          </div>

          <!-- Details -->
          <p class="text-primary-600"><strong>Nama:</strong> {result.Nama}</p>
          <p>
            <strong>Nama Penjamin:</strong>
            {result.NamaPenjamin === "0" ? "-" : result.NamaPenjamin}
          </p>
          <p>
            <strong>Nomor Register:</strong>
            {result.NomorRegisterIntegrasi === "0"
              ? "-"
              : result.NomorRegisterIntegrasi}
          </p>
          <p>
            <strong>Masa Bimbingan Akhir:</strong>
            {result.MasaBimbinganSaatIniAkhir === "0"
              ? "-"
              : new Date(
                  (result.MasaBimbinganSaatIniAkhir - 25569) * 86400 * 1000
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

<!-- <div class="container mx-auto px-4 content-start bg-bl ">
    <h1 class="text-2xl font-bold mb-4 text-center">Wajib Lapor</h1>
  
    
    <div class="flex justify-center items-center mb-6">
      <input
        type="text"
        placeholder="Ketik nama klien disini"
        bind:value={searchQuery}
        class="block w-full max-w-md px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        on:click={fetchData}
        class="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring focus:ring-blue-300"
      >
        Cari Nama Klien
      </button>
    </div>
  
    {#if isLoading}
      <p class="text-center text-gray-500">Tunggu Sebentar...</p>
    {:else if errorMessage}
      <p class="text-center text-red-500">{errorMessage}</p>
    {:else if results.length > 0}
      <div class="overflow-x-auto">
        <table class="min-w-full text-sm text-left text-gray-500 border border-gray-200">
          <thead class="bg-gray-50 text-gray-700 uppercase text-xs">
            <tr>
              <th class="py-3 px-4">Tombol Wajib Lapor</th>
              <th class="py-3 px-4">Nama</th>
              <th class="py-3 px-4">Nama Penjamin</th>
              <th class="py-3 px-4">Nomor Register</th>
              <th class="py-3 px-4">Masa Bimbingan Akhir</th>
              <th class="py-3 px-4">Asal Lapas / Peminta Litmas</th>
            </tr>
          </thead>
          <tbody>
            {#each results as result}
              <tr class="bg-white border-b hover:bg-gray-50">
                <td class={`py-3 px-4 ${getStatusColor(result.LitmasTerselesaikan)}`}>
                  {#if result.WajibLapor === 'Ya'}
                    <button
                      class="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                      on:click={() => navigateToDetail(result._id)}
                    >
                      Klik
                    </button>
                  {:else}
                    <p class="text-sm text-gray-500">
                      Anda tidak berhak Wajib Lapor Online<br />
                      Hubungi PK Anda
                    </p>
                  {/if}
                </td>
                <td class="py-3 px-4">{result.Nama}</td>
                <td class="py-3 px-4">{result.NamaPenjamin === '0' ? '-' : result.NamaPenjamin}</td>
                <td class="py-3 px-4">{result.NomorRegisterIntegrasi === '0' ? '-' : result.NomorRegisterIntegrasi}</td>
                <td class="py-3 px-4">
                  {result.MasaBimbinganSaatIniAkhir === '0'
                    ? '-'
                    : new Date((result.MasaBimbinganSaatIniAkhir - 25569) * 86400 * 1000).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                </td>
                <td class="py-3 px-4">{result.NamaLapas}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="text-center text-gray-500">Nama Tidak Ditemukan / Anda Belum Mencari</p>
    {/if}
  </div> -->

<BotNav />
