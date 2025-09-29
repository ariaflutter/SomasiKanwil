<script>
  // @ts-nocheck
  import { onMount } from "svelte";
  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";
  import Footerku from "./footerku.svelte";
  import { DotsHorizontalOutline } from "flowbite-svelte-icons";
  import { Section, ContentWithImage } from "flowbite-svelte-blocks";
  const apiUrl = import.meta.env.VITE_API_URL;
  let BeritaData = []; // Use BeritaData consistently

  onMount(async () => {
    try {
      const response = await fetch(`/api/berita-data`);
      BeritaData = await response.json(); // Store fetched data in BeritaData

      console.log(BeritaData);

      // Sort the posts by timestamp in descending order to get the latest posts
      BeritaData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limit to the 6 latest posts
      BeritaData = BeritaData.slice(0, 20); // Limit to top 10 articles
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  });
</script>

<Nav />
<div
  class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white pt-8"
>
  Berita Bapas Jember
</div>
<!-- Display articles -->
<div class="container mx-auto pt-10 pb-10 px-4 lg:px-8">
  {#each BeritaData as article}
    <div
      class="article bg-white shadow-lg rounded-3xl overflow-hidden mb-6 hover:shadow-xl transition-shadow duration-300 ease-in-out grid grid-cols-1 xl:grid-cols-2"
    >
      <!-- Article Image -->
      {#if article.image}
        <img
          src={article.image}
          alt={article.title}
          class="object-cover w-full rounded-3xl"
        />
      {:else}
        <img
          src="../Logo.png"
          alt="Fallback image"
          class="object-cover w-full rounded-3xl"
        />
      {/if}

      <!-- Article Content -->
      <div class="p-10">
        <h2
          class="text-3xl font-semibold text-gray-800 hover:text-primary-600 transition-colors duration-200 text-left"
        >
          {article.title}
        </h2>
        <p class="text-sm text-gray-500 mt-2 text-left">
          <span class="font-medium">{article.author}</span>
          <span class="mx-2">|</span>
          <span class="text-gray-400"
            >{new Date(article.timestamp).toLocaleDateString()}</span
          >
        </p>
        <p class="mt-4 text-gray-500 text-justify">{article.content}</p>
      </div>

      <!-- Read More Link (Optional) -->
      <div class="p-6 border-t border-gray-200 text-left">
        <a href={article.link} class="text-primary-600 hover:underline text-sm"
          >Baca Selengkapnya</a
        >
      </div>
    </div>
  {/each}
</div>

<Footerku />
<BotNav />
