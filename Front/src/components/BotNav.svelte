<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import "../app.css";
  import {
    BottomNav,
    BottomNavItem,
    Skeleton,
    ImagePlaceholder,
  } from "flowbite-svelte";
  import {
    HomeSolid,
    WalletSolid,
    AdjustmentsVerticalOutline,
    UserCircleSolid,
    BullhornSolid,
  } from "flowbite-svelte-icons";
  import { SearchOutline } from "flowbite-svelte-icons";
  import {
    BottomNavHeader,
    BottomNavHeaderItem,
    Tooltip,
  } from "flowbite-svelte";
  import { BookmarkSolid, PlusOutline } from "flowbite-svelte-icons";
  let currentPage;
  onMount(() => {
    currentPage = window.location.pathname; // Get the current path of the URL
  });
</script>

<BottomNav position="fixed" navType="group" classInner="grid-cols-5">
  <BottomNavItem btnName="Home" id="group-home" href="/">
    <HomeSolid
      class="w-6 h-6 mb-1 {currentPage === '/'
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:dark:text-primary-400'}"
    />
    <Tooltip arrow={false}>Halaman</Tooltip>
  </BottomNavItem>
  <BottomNavItem btnName="Bookmark" id="group-bookmark" href="/tentang">
    <BookmarkSolid
      class="w-6 h-6 mb-1 {currentPage === '/tentang'
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:dark:text-primary-400'}"
    />
    <Tooltip arrow={false}>Tentang</Tooltip>
  </BottomNavItem>
  <BottomNavItem btnName="New post" id="group-new" href="/wajib-lapor">
    <PlusOutline
      class="w-6 h-6 mb-1 {currentPage === '/wajib-lapor'
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:dark:text-primary-400'}"
    />
    <Tooltip arrow={false}>Wajib Lapor</Tooltip>
  </BottomNavItem>
  <BottomNavItem btnName="Search" id="group-search" href="/status-litmas">
    <SearchOutline
      class="w-6 h-6 mb-1 {currentPage === '/status-litmas'
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:dark:text-primary-400'}"
    />
    <Tooltip arrow={false}>Status Litmas</Tooltip>
  </BottomNavItem>
  <BottomNavItem btnName="BullhornSolid" id="group-settings" href="/berita">
    <BullhornSolid
      class="w-6 h-6 mb-1 {currentPage === '/berita'
        ? 'text-primary-600 dark:text-primary-400'
        : 'text-gray-500 dark:text-gray-400 group-hover:text-primary-600 group-hover:dark:text-primary-400'}"
    />
    <Tooltip arrow={false}>Berita Kantor Wilayah</Tooltip>
  </BottomNavItem>
</BottomNav>
