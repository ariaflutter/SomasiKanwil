<script>
  import { onMount } from "svelte";
  import Sidebar from "./Sidebar.svelte";
  import { navigate } from "svelte-routing";
  import { Datepicker } from "flowbite-svelte";
  import {
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
  } from "flowbite-svelte";
  const apiUrl = import.meta.env.VITE_API_URL;

  let searchResults = [];
  let selectedDate = new Date();
  let errorMessage = "";
  let tableSearch = "";

  function formatDate(date) {
    return date.toLocaleDateString("en-CA");
  }

  async function searchByDate(date) {
    if (!date) {
      errorMessage = "Please select a date to search.";
      return;
    }

    try {
      const response = await fetch(
        `/api/search-wajib-lapor-by-date?date=${date}`
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();
      const uniqueResults = [];
      const seenNames = new Set();

      for (const item of data) {
        if (!seenNames.has(item.Nama)) {
          seenNames.add(item.Nama);
          uniqueResults.push(item);
        }
      }

      searchResults = uniqueResults.map((result) => {
        const coordsMatch = result.location
          ? result.location.match(
              /Latitude:\s*([-+]?[0-9]*\.?[0-9]+),\s*Longitude:\s*([-+]?[0-9]*\.?[0-9]+)/
            )
          : null;
        const coords = coordsMatch
          ? { lat: coordsMatch[1], lng: coordsMatch[2] }
          : null;
        return { ...result, coords };
      });
      errorMessage = ""; // Clear error message on success
    } catch (error) {
      console.error("Error fetching data:", error);
      errorMessage = `No records found for the date: ${date}`;
    }
  }

  function handleDateSelect(event) {
    const tanggal = formatDate(event.detail);
    searchByDate(tanggal);
  }

  $: filteredResults = searchResults.filter((item) =>
    item.Nama.toLowerCase().includes(tableSearch.toLowerCase())
  );

  onMount(() => {
    searchByDate(formatDate(selectedDate));
  });

  async function handleNameClick(name) {
    if (!name) {
      errorMessage = "Nama tidak boleh kosong.";
      return;
    }

    try {
      // Search the API using the provided name
      const response = await fetch(
        `/api/search?nama=${encodeURIComponent(name)}&exact=true`
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error: ${response.status} - ${errorMessage}`);
      }

      const data = await response.json();

      // Find the ID of the result
      if (data.length > 0) {
        const { _id } = data[0]; // Assume the first result is correct
        navigateToDetail(_id); // Navigate to the detail page
      } else {
        errorMessage = `Data dengan nama "${name}" tidak ditemukan.`;
      }
    } catch (error) {
      console.error("Error during name search:", error);
      errorMessage = `Terjadi kesalahan saat mencari nama: ${name}`;
    }
  }

  function navigateToDetail(id) {
    navigate(`/detail-klien/${id}`); // Navigate to the detail page with the specific ID
  }
</script>

<Sidebar />

<h2 class="text-md font-bold m-0 flex items-center justify-center p-4 mt-20">
  List Wajib Lapor
</h2>

<div class="flex items-center justify-center">
  <div class="max-w-screen-lg w-screen justify-center items-center px-20">
    <Datepicker
      dateFormat={{ year: "numeric", month: "numeric", day: "numeric" }}
      color="primary"
      bind:value={selectedDate}
      on:select={handleDateSelect}
    />
    <div class="my-4">
      <input
        type="text"
        placeholder="Cari Nama Klien disini..."
        bind:value={tableSearch}
        class="p-2 border rounded-2xl w-full"
      />
    </div>
  </div>
</div>

<div class="flex items-center justify-center">
  <div
    class="max-w-screen-xl w-screen p-4 rounded-2xl justify-center items-center h-screen"
  >
    {#if searchResults.length > 0}
      <Table class="rounded-xl">
        <TableHead>
          <TableHeadCell>Nomor</TableHeadCell>
          <TableHeadCell>Tanggal</TableHeadCell>
          <TableHeadCell>Nama</TableHeadCell>
          <TableHeadCell>Nama Pembimbing Kemasyarakatan</TableHeadCell>
          <TableHeadCell>Lokasi</TableHeadCell>
          <TableHeadCell>Foto</TableHeadCell>
          <TableHeadCell>Detail</TableHeadCell>
        </TableHead>
        <TableBody>
          {#if filteredResults.length > 0}
            {#each filteredResults as result, index}
              <TableBodyRow>
                <TableBodyCell>{index + 1}</TableBodyCell>
                <TableBodyCell>{result.TanggalHariIni}</TableBodyCell>
                <TableBodyCell>{result.Nama}</TableBodyCell>
                <TableBodyCell>{result.NamaPK}</TableBodyCell>
                <TableBodyCell>
                  <a
                    href={`https://maps.google.com/?q=${result.latitude},${result.longitude}`}
                    target="_blank"
                    style="color: blue; text-decoration: underline;"
                  >
                    View Location
                  </a>
                </TableBodyCell>
                <TableBodyCell>
                  {#if result.photoPath}
                    <img
                      src={`${result.photoPath}`}
                      alt="Photo"
                      style="width: auto; height: 100px;"
                    />
                  {:else}
                    No photo available
                  {/if}
                </TableBodyCell>
                <TableBodyCell
                  ><button
                    class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-primary-900"
                    on:click={() => handleNameClick(result.Nama)}
                  >
                    Cek
                  </button></TableBodyCell
                >
              </TableBodyRow>
            {/each}
          {:else}
            <tr>
              <td colspan="6" class="text-center text-red-500 py-4">
                Nama yang Anda cari tidak ditemukan.
              </td>
            </tr>
          {/if}
        </TableBody>
      </Table>
    {:else}
      <p class="text-red-500">Tidak Ada Data pada Tanggal Saat itu</p>
    {/if}
  </div>
</div>

<style>
  img {
    border-radius: 5px;
  }
</style>
