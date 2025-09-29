<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import { GradientButton } from "flowbite-svelte";
  import BotNav from "./BotNav.svelte";
  import { navigate } from "svelte-routing";

  const apiUrl = import.meta.env.VITE_API_URL;

  let userData = null;
  let errorMessage = "";
  let userLocation = "";
  let videoStream;
  let photo;
  let capturing = false;
  let locationErrorMessage = "";
  let cameraErrorMessage = "";
  let permissionDenied = false;
  let todayDate = "";
  let photoFile = null;
  let latitude = "";
  let longitude = "";

  async function fetchUserData() {
    const urlParts = window.location.pathname.split("/");
    const userId = urlParts[urlParts.length - 1];

    if (!userId) {
      errorMessage = "Invalid user ID";
      return;
    }

    try {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch user data");
      userData = await response.json();
    } catch (error) {
      errorMessage = error.message;
      console.error("Error fetching user data:", error);
    }
  }

  function getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          userLocation = `${latitude}, ${longitude}`;
          locationErrorMessage = "";
        },
        (error) => {
          locationErrorMessage =
            "Unable to retrieve location: " + error.message;
          userLocation = "";
          permissionDenied = true;
        }
      );
    } else {
      locationErrorMessage = "Geolocation is not supported by this browser.";
      userLocation = "";
      permissionDenied = true;
    }
  }

  function startCamera() {
    capturing = true;
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoStream = stream;
        const video = document.getElementById("videoElement");
        video.srcObject = stream;
        video.play();
        cameraErrorMessage = "";
      })
      .catch((error) => {
        cameraErrorMessage = "Error accessing camera: " + error.message;
        capturing = false;
        permissionDenied = true;
      });
  }

  function takePicture() {
    const canvas = document.createElement("canvas");
    const video = document.getElementById("videoElement");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    photo = canvas.toDataURL("image/jpeg", 0.7);

    fetch(photo)
      .then((res) => res.blob())
      .then((blob) => {
        photoFile = new File([blob], "photo.jpeg", { type: "image/jpeg" });
      });

    stopCamera();
  }

  function stopCamera() {
    if (videoStream) videoStream.getTracks().forEach((track) => track.stop());
    capturing = false;
  }

  async function submitToDatabase() {
    const formData = new FormData();
    formData.append("RegisterUtama", userData.RegisterUtama);
    formData.append("Nama", userData.Nama);
    formData.append("Alamat", userData.Alamat);
    formData.append("Katagori", userData.Katagori);
    formData.append("Pasal", userData.Pasal);
    formData.append("NamaPK", userData.NamaPK);
    formData.append("TanggalHariIni", todayDate);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);

    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const response = await fetch(`/api/wajiblapor`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message || "Terima Kasih Anda Telah Wajib Lapor");
        navigate("/self-service");
      } else {
        alert(result.message || "Maaf Wajib Lapor Gagal Segera Hubungi Petugas");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  }






  function fetchTodayDate() {
    const date = new Date();
    todayDate = date.toISOString().split("T")[0];
  }

  onMount(() => {
    fetchUserData();
    getCurrentLocation();
    fetchTodayDate();
  });
</script>

<!-- Tailwind CSS Integration -->
<div class=" gap-6 p-6 min-h-screen">
  {#if permissionDenied}
    <div
      class="grid grid-cols-1! p-6 bg-red-100 text-red-800 border border-red-300 rounded shadow"
    >
      <p>
        Maaf, anda harus memberikan izin GPS dan Kamera untuk mendapatkan
        layanan silahkan kunjungi <a href="/tutorial">disini</a> untuk mengetahui
        cara memberikan akses GPS dan Kamera.
      </p>
    </div>
  {:else}
    <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
      <div class="p-6 bg-white rounded-lg shadow-md">
        {#if errorMessage}
          <p class="text-red-600">{errorMessage}</p>
        {:else if userData}
          <h3 class="text-lg font-semibold text-blue-600 mb-2">
            Detail Pengguna
          </h3>
          <p><strong>Register Utama:</strong> {userData.RegisterUtama}</p>
          <p class="text-red-600"><strong>Nama:</strong> {userData.Nama}</p>
          <p><strong>Nama Penjamin:</strong> {userData.NamaPenjamin}</p>
          <p><strong>Alamat:</strong> {userData.Alamat}</p>
          <p><strong>Katagori:</strong> {userData.Katagori}</p>
          <p><strong>Pasal:</strong> {userData.Pasal}</p>
          <p><strong>Pembimbing:</strong> {userData.NamaPK}</p>
          <p><strong>Tanggal:</strong> {todayDate}</p>
        {:else}
          <p>Loading...</p>
        {/if}
        <h3 class="text-lg font-semibold text-blue-600 mb-2 mt-8">
          Lokasi Saat Ini
        </h3>
        {#if locationErrorMessage}
          <p class="text-red-600">{locationErrorMessage}</p>
        {:else}
          <p>{userLocation || "Fetching location..."}</p>
        {/if}
      </div>

      <!-- Location Section -->
      <div>
        <!-- Camera Section -->
        <div class="p-6 bg-white rounded-lg shadow-md">
          <h3 class="text-lg font-semibold text-blue-600 mb-2">Kamera</h3>
          {#if capturing}
            <!-- svelte-ignore a11y_media_has_caption -->
            <video id="videoElement" autoplay class=" rounded-xl"></video>
            <div class="flex gap-4 mt-4">
              <button
                class="px-4 py-2 bg-green-500 text-white rounded shadow"
                on:click={takePicture}
              >
                Ambil Foto
              </button>
              <button
                class="px-4 py-2 bg-red-500 text-white rounded shadow"
                on:click={stopCamera}
              >
                Tutup Kamera
              </button>
            </div>
          {:else}
            <button
              class="px-4 py-2 bg-blue-500 text-white rounded shadow"
              on:click={startCamera}
            >
              Buka Kamera
            </button>
          {/if}

          {#if cameraErrorMessage}
            <p class="text-red-600 mt-2">{cameraErrorMessage}</p>
          {/if}

          {#if photo}
            <h3 class="text-md font-semibold mt-4">Foto yang Diambil</h3>
            <!-- svelte-ignore a11y_img_redundant_alt -->
            <img
              src={photo}
              alt="Captured photo"
              class="w-full rounded-lg mt-2"
            />
          {/if}
        </div>
      </div>
    </div>
    <!-- Submit Section -->
    <div class="mb-8 mt-10 rounded-lg text-center">
      <GradientButton color="blue" on:click={submitToDatabase}
        >Kirim Data</GradientButton
      >
    </div>
  {/if}
</div>

<BotNav />
