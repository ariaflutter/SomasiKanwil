<script>
  import { onMount } from "svelte";
  import "leaflet/dist/leaflet.css";
  import L from "leaflet";
  import Sidebar from "./Sidebar.svelte";
  import { Datepicker } from "flowbite-svelte";
  const apiUrl = import.meta.env.VITE_API_URL;

  let map;
  let markers = [];
  let selectedDate = new Date(); // Default to today

  // Helper function to format date properly for the API
  function formatDate(date) {
    return date.toLocaleDateString("en-CA");
  }

  // Function to handle date selection and fetch corresponding locations
  function handleDateSelect(event) {
    console.log("Selected date:", event.detail);
    const tanggal = formatDate(event.detail);
    console.log(tanggal);
    fetchLocations(tanggal);
  }

  // Function to fetch locations from the API based on the selected date
  async function fetchLocations(date) {
    try {
      const response = await fetch(
        `/api/search-wajib-lapor-by-date?date=${date}`
      );
      const data = await response.json();

      // If no records are found, handle gracefully
      if (data.message) {
        console.warn(data.message); // You can show a user-friendly message here
        return;
      }

      // Log the fetched data for debugging
      console.log("Fetched data:", data);

      // Clear previous markers and add new ones
      clearMarkers(); // First, clear any existing markers
      markers = data
        .map((item) => {
          const lat = parseFloat(item.latitude);
          const lng = parseFloat(item.longitude);

          // Check if lat/lng are valid numbers
          if (isNaN(lat) || isNaN(lng)) {
            console.error(`Invalid coordinates for item:`, item);
            return null; // Skip invalid coordinates
          }

          // Create a marker and bind a popup with the item's details
          const marker = L.marker([lat, lng]);
          const popupContent = `
              <strong>Nama:</strong> ${item.Nama}<br>
              <strong>Alamat:</strong> ${item.Alamat}<br>
              <strong>Pasal:</strong> ${item.Pasal}<br>
              <strong>Perkara:</strong> ${item.Perkara || "N/A"}<br>
              <strong>Tanggal:</strong> ${item.TanggalHariIni}<br>
              <strong>Nama PK:</strong> ${item.NamaPK}<br>
              <img src="${item.photoPath}" alt="Photo" style="width: 100px; height: auto;">
            `;
          marker.bindPopup(popupContent);
          return marker; // Return the marker for adding to the map
        })
        .filter((marker) => marker !== null); // Filter out any null markers

      // Add the new markers to the map
      markers.forEach((marker) => marker.addTo(map));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  }

  // Function to clear existing markers from the map
  function clearMarkers() {
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer); // Remove markers from the map
      }
    });
  }

  // Initialize map when the component mounts
  onMount(async () => {
    map = L.map("map").setView([-8.1721374, 113.7045119], 8); // Set the initial view of the map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Fetch locations for the initial date when the component is mounted
    await fetchLocations(formatDate(selectedDate));
  });
</script>

<Sidebar />

<div
  class="flex flex-col h-screen items-center justify-center body w-screen mt-20 scrollbar"
>
  <div class="flex flex-1 justify-center text-center">
    <h2 class="text-md font-bold m-0 flex items-center justify-center p-4">
      Peta Wajib Lapor
    </h2>
  </div>

  <!-- Date Picker -->
  <div class="w-full sm:w-96 px-10">
    <Datepicker
      dateFormat={{ year: "numeric", month: "numeric", day: "numeric" }}
      color="primary"
      bind:value={selectedDate}
      on:select={handleDateSelect}
    ></Datepicker>
  </div>

  <!-- Map Container -->
  <div class="flex justify-center items-center w-full">
    <div
      id="map"
      class="z-0 rounded-3xl w-full max-w-[90%] max-h-[90%] h-[90vh] sm:h-[90vh] lg:h-[90vh] border border-gray-300 shadow-lg"
    ></div>
  </div>
</div>

<style>
  #map {
    /* Ensure map adapts properly */
    min-height: 300px; /* Minimum height for small screens */
  }
  .body {
    max-width: 1850;
  }
</style>
