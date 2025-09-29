<script>
  import { Section, Register } from "flowbite-svelte-blocks";
  import { Button, Checkbox, Label, Input } from "flowbite-svelte";
  import { SpeedDial, SpeedDialButton } from "flowbite-svelte";
  import { DarkMode } from "flowbite-svelte";

  // --- PERBAIKAN 1: Hapus apiUrl. Kita akan menggunakan URL relatif ---
  // const apiUrl = import.meta.env.VITE_API_URL;

  let username = "";
  let password = "";
  let message = "";

  async function handleSubmit() {
    try {
      // --- PERBAIKAN 1 (Lanjutan): Gunakan URL relatif agar melewati proxy ---
      const response = await fetch('/api/auth/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        // Tambahkan 'credentials: include' di sini juga sebagai praktik terbaik,
        // meskipun untuk login tidak selalu wajib, ini membuat semuanya konsisten.
        credentials: "include"
      });

      const data = await response.json();
      message = data.message;

      if (response.ok) {
        // Hapus penyimpanan manual di localStorage, karena sesi sudah ditangani
        // oleh cookie httpOnly yang lebih aman.
        // localStorage.setItem("username", username);
        // localStorage.setItem("role", data.role);

        // --- PERBAIKAN 2: Gunakan logika 'OR' yang benar untuk redirect ---
        if (data.role === "Petugas" || data.role === "Supervisor") {
          window.location.href = "/show"; // Arahkan ke halaman daftar klien
        } else if (data.role === "Klien") {
          window.location.href = "/dashboard-klien";
        } else {
          // Fallback jika ada role lain
          window.location.href = "/";
        }
      }
    } catch (error) {
        console.error("Login error:", error);
        message = "Tidak dapat terhubung ke server. Silakan coba lagi.";
    }
  }
</script>

<SpeedDial defaultClass="absolute end-6 bottom-20 fixed"><DarkMode /></SpeedDial
>
<DarkMode class="hidden" />
<div class="max-w-screen-md w-screen mt-16">
  <Section name="login">
    <Register href="/">
      <svelte:fragment slot="top">
        <img class="w-40 h-auto mr-2" src="../Logo.png" alt="logo" />
      </svelte:fragment>
      <div
        class="p-6 space-y-4 md:space-y-6 sm:p-8"
        on:submit|preventDefault={handleSubmit}
      >
        <form class="flex flex-col space-y-6" action="/">
          <h3 class="text-xl font-medium text-gray-900 dark:text-white p-0">
            Login
          </h3>
          <Label class="space-y-2">
            <span>Your username</span>
            <Input
              type="text"
              name="username"
              placeholder="username "
              bind:value={username}
              required
            />
          </Label>
          <Label class="space-y-2">
            <span>Your password</span>
            <Input
              type="password"
              name="password"
              placeholder="password"
              bind:value={password}
              required
            />
          </Label>
          <div class="flex items-start"></div>
          <Button type="submit" class="w-full1">Sign in</Button>
          {#if message}
            <p class="text-sm font-light text-gray-500 dark:text-gray-400">
              {message}
            </p>
          {/if}
        </form>
      </div>
    </Register>
  </Section>
</div>
