<script>
  import {
    Sidebar,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
    SidebarCta,
    GradientButton,
  } from "flowbite-svelte";
  import {
    ChartPieOutline,
    CloudArrowUpOutline,
    MapPinAltOutline,
    RectangleListOutline,
    UserOutline,
    CirclePlusOutline,
    UserSettingsOutline,
    LockTimeOutline
  } from "flowbite-svelte-icons";

  let isSidebarOpen = false;
</script>

<div>
  <div
    class="fixed top-0 left-0 z-40 w-screen h-16 bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700 px-5"
  >
    <nav class="flex items-center justify-between mx-auto p-2">
      <a
        href="/show"
        class="flex items-center space-x-3 rtl:space-x-reverse h-12"
      >
        <img src="../Logo.png" class="h-8" alt="Logo" />
        <span class="font-semibold text-md dark:text-white"
          >Somasi Kanwil Jatim</span
        >
      </a>

      <button
        class="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-controls="sidebar"
        aria-expanded={isSidebarOpen}
        on:click={() => (isSidebarOpen = !isSidebarOpen)}
      >
        <svg
          class="w-6 h-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={isSidebarOpen
              ? "M6 18L18 6M6 6l12 12"
              : "M4 6h16M4 12h16M4 18h16"}
          />
        </svg>
      </button>
    </nav>
  </div>

  <div
    id="sidebar"
    class={`fixed left-0 top-0 z-30 w-100  dark:bg-gray-900 transition-transform ${
      isSidebarOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    <Sidebar class=" overflow-hidden rounded-3xl mt-16 p-4  w-72">
      <SidebarWrapper class="rounded-3xl">
        <SidebarGroup>
          <SidebarItem
            label="Dashboard"
            class="text-sm font-bold text-gray-500"
            href="/show"
          >
            <svelte:fragment slot="icon">
              <ChartPieOutline
                class="w-6 h-6 text-gray-500 dark:text-gray-400"
              />
            </svelte:fragment>
          </SidebarItem>
          <SidebarItem
            label="Upload / Refresh Data"
            class="text-sm font-bold text-gray-500"
            href="/upload-data"
          >
            <svelte:fragment slot="icon">
              <CloudArrowUpOutline
                class="w-6 h-6 text-gray-500 dark:text-gray-400"
              />
            </svelte:fragment>
          </SidebarItem>
          
          <SidebarItem
            label="Change Password"
            class="text-sm font-bold text-gray-500"
            href="/change-password"
          >
            <svelte:fragment slot="icon">
              <LockTimeOutline
                class="w-6 h-6 text-gray-500 dark:text-gray-400"
              />
            </svelte:fragment>
          </SidebarItem>
        </SidebarGroup>
        <div class="flex flex-col justify-end w-32 mt-20">
          <GradientButton href="/" color="pinkToOrange">Logout</GradientButton>
        </div>
      </SidebarWrapper>
    </Sidebar>
  </div>

  {#if isSidebarOpen}
    <div
      class="fixed inset-0 z-20 bg-black opacity-25"
      on:click={() => (isSidebarOpen = false)}
    ></div>
  {/if}
</div>
