<script>
  // @ts-nocheck
  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";
  import Footerku from "./footerku.svelte";
  import { Section, ContentWithImage } from "flowbite-svelte-blocks";
  import { Hr } from "flowbite-svelte";
  import { Blockquote } from "flowbite-svelte";
  import { QuoteSolid } from "flowbite-svelte-icons";
  import {
    HeroHeader,
    FeatureDefault,
    FeatureItem,
  } from "flowbite-svelte-blocks";
  import {
    ChartPieSolid,
    ClockSolid,
    BriefcaseSolid,
  } from "flowbite-svelte-icons";
  import { Faq, FaqItem } from "flowbite-svelte-blocks";
  import {
    TeamWrapper,
    TeamHeader,
    TeamBody,
    TeamItem,
  } from "flowbite-svelte-blocks";

  // Data developer tidak perlu diubah karena ini tentang pembuat aplikasi
  let members = [
    {
      href: "https://www.instagram.com/gema.eka.adi.pamungkas/",
      src: "/X.jpg",
      alt: "Gema Eka Adi Pamungkas",
      name: "Gema Eka Adi Pamungkas",
      jobTitle: "Lead Developer",
      description: "Full Stack Engineer and UI / UX Designer ",
    },
  ];
</script>

<Nav />
<div
  class="container grid grid-cols-1 xl:grid-cols-2 pt-20 max-w-screen-xl p-4 xl:px-4"
>
  <div>
    <figure class="mx-auto max-w-screen-md text-center pb-8">
      <QuoteSolid
        class="mx-auto mb-3 w-12 h-12 text-gray-400 dark:text-gray-600"
      />
      <Blockquote alignment="center" size="2xl"
        >"Inovasi dalam pelayanan itu bukan gimmick untuk mendapatkan predikat
        WBK / WBBM, tetapi adalah pengejawantahan diri untuk memberikan yang
        terbaik untuk masyarakat dan negeri"</Blockquote
      >
      <figcaption
        class="flex justify-center items-center mt-6 space-x-3 rtl:space-x-reverse"
      >
        <a href="https://www.instagram.com/gema.eka.adi.pamungkas/"
          ><img
            class="w-8 h-8 rounded-full"
            src="/X.jpg"
            alt="Gema Eka Profile"
          /></a
        >
        <div
          class="flex items-center divide-x-2 rtl:divide-x-reverse divide-gray-500 dark:divide-gray-700"
        >
          <cite class="pe-3 font-medium text-gray-900 dark:text-white"
            >Gema Eka Adi Pamungkas</cite
          >
          <cite class="ps-3 text-sm font-light text-gray-500 dark:text-gray-400"
            >Pembimbing Kemasyarakatan Ahli Pertama</cite
          >
        </div>
      </figcaption>
    </figure>

    <p>
      Aksara (Aplikasi Kendali dan Supervisi Klien Pemasyarakatan) hadir untuk mempermudah Pengguna Layanan dan Pegawai di seluruh
      Balai Pemasyarakatan di Kantor Wilayah Jawa Timur dalam melaksanakan kegiatan
      administrasi yang lebih komprehensif dan modern, demi terwujudnya tata kelola
      data dan implementasi core business pemasyarakatan yang unggul.
    </p>
    <br /><br />
    <p>
      Platform ini dirancang untuk mendukung tata pemerintahan yang lebih modern
      dan akuntabel, dapat digunakan oleh para pimpinan di tingkat wilayah untuk
      mendapatkan data agregat yang disajikan secara komprehensif dan akurat
      dari seluruh UPT Pemasyarakatan.
    </p>
    <br /><br />
    <p>
      Aksara dirancang untuk dapat terintegrasi dengan berbagai sistem administrasi
      internal yang ada di masing-masing Bapas, memungkinkan standarisasi dan
      kualitas data yang lebih baik untuk pelaporan yang cepat dan akurat sesuai
      kebutuhan dinamis organisasi.
    </p>
  </div>
  <div class="content-center gap-4">
    <Section name="contentwithimg">
      <ContentWithImage>
        <svelte:fragment slot="image">
          <img
            class="w-full rounded-xl gap-6"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-2.png"
            alt="office content 1"
          />
          <img
            class="mt-4 w-full lg:mt-10 rounded-xl gap-6"
            src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/content/office-long-1.png"
            alt="office content 2"
          />
        </svelte:fragment>
      </ContentWithImage>
    </Section>
  </div>
</div>

<Hr classHr="my-8" />

<div class="container text-center pt-10 pb-10 p-4 xl:px-4">
  <Section name="feature">
    <HeroHeader
      class="max-w-screen-xl mb-8 lg:mb-16"
      h2Class="mb-4 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white"
      pClass="text-gray-500 sm:text-xl dark:text-gray-400"
    >
      <svelte:fragment slot="h2"
        >Untuk Bapas di Jawa Timur Lebih Baik, Lebih Intuitif, Lebih Aman, Lebih Mudah,
        Lebih Modern</svelte:fragment
      >
      <svelte:fragment slot="paragraph"
        >Aksara hadir untuk memberikan layanan yang lebih baik kepada seluruh
        pengguna layanan di Kantor Wilayah Jawa Timur, mendukung reformasi
        birokrasi dan transparansi layanan di lingkup Kementerian Hukum dan HAM.</svelte:fragment
      >
    </HeroHeader>
    <FeatureDefault
      class="max-w-screen-xl mb-8 lg:mb-16 grid grid-cols-1 xl:grid-cols-3 object-center text-left gap-5"
    >
      <FeatureItem class="">
        <svelte:fragment slot="icon"
          ><ChartPieSolid
            class="text-primary-600 dark:text-primary-300 "
          /></svelte:fragment
        >
        <svelte:fragment slot="h3">Dashboard Terpusat</svelte:fragment>
        <svelte:fragment slot="paragraph"
          >Dashboard terbaru didesain untuk mempermudah para pimpinan di
          tingkat wilayah mendapatkan data dari seluruh Bapas di Jawa Timur secara
          komprehensif dan real-time.</svelte:fragment
        >
      </FeatureItem>
      <FeatureItem>
        <svelte:fragment slot="icon"
          ><ClockSolid
            class="text-primary-600 dark:text-primary-300"
          /></svelte:fragment
        >
        <svelte:fragment slot="h3">Cepat & Responsif</svelte:fragment>
        <svelte:fragment slot="paragraph"
          >Kode yang telah dioptimisasi dan tech-stack modern membuat
          pengalaman menggunakan layanan menjadi lebih cepat dan responsif
          di berbagai perangkat.</svelte:fragment
        >
      </FeatureItem>
      <FeatureItem>
        <svelte:fragment slot="icon"
          ><BriefcaseSolid
            class="text-primary-600 dark:text-primary-300"
          /></svelte:fragment
        >
        <svelte:fragment slot="h3">Terintegrasi</svelte:fragment>
        <svelte:fragment slot="paragraph"
          >Aksara dirancang untuk terintegrasi dengan berbagai sistem data
          internal, seperti Kuro, Kawa, dan lainnya yang digunakan di Bapas
          se-Jawa Timur untuk menciptakan sumber data yang terpadu.</svelte:fragment
        >
      </FeatureItem>
    </FeatureDefault>
  </Section>
</div>

<Hr classHr="my-8" />
<Section name="faq">
  <h2
    class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white p-4 xl:px-4"
  >
    Pertanyaan Umum
  </h2>
  <Faq
    class="grid grid-cols-1 xl:grid-cols-2  text-justify gap-8 pt-10 p-4 xl:px-4"
  >
    <div class="p-4 xl:px-4">
      <FaqItem>
        <svelte:fragment slot="h3"
          >Mengapa Harus Menggunakan Aksara?</svelte:fragment
        >
        <p class="text-gray-500 dark:text-gray-400">
          Aksara memberikan kemudahan bagi para pimpinan di tingkat wilayah maupun
          satuan kerja untuk memonitor dan menganalisis data dari seluruh Balai
          Pemasyarakatan di Jawa Timur secara efisien.
        </p>
      </FaqItem>
      <FaqItem>
        <svelte:fragment slot="h3"
          >Apa Saja yang dibutuhkan untuk mengakses Aksara?</svelte:fragment
        >
        <p class="text-gray-500 dark:text-gray-400">
          Sebagai pengguna layanan, Anda mungkin perlu memberikan izin akses
          terhadap kamera dan lokasi (geolocation) pada perangkat Anda,
          tergantung pada fitur yang digunakan.
        </p>
      </FaqItem>
    </div>
    <div>
      <FaqItem>
        <svelte:fragment slot="h3"
          >Mengapa Saya Tidak Bisa Mengakses Wajib Lapor Online?</svelte:fragment
        >
        <p class="text-gray-500 dark:text-gray-400">
          Pengguna layanan harus berkoordinasi dengan Pembimbing Kemasyarakatan
          masing-masing untuk mendapatkan akses Wajib Lapor Online. Kebijakan ini
          diterapkan berdasarkan penilaian risiko individual oleh Pembimbing
          Kemasyarakatan.
        </p>
      </FaqItem>
      <FaqItem>
        <svelte:fragment slot="h3"
          >Seperti Apa Perkembangan Aksara di Masa Depan?</svelte:fragment
        >
        <p class="text-gray-500 dark:text-gray-400">
          Aksara akan terus dikembangkan seiring dengan kebutuhan Direktorat
          Jenderal Pemasyarakatan dan Kementerian Hukum dan HAM untuk menyajikan
          dan mengelola data secara realtime sesuai dengan kebutuhan organisasi.
        </p>
      </FaqItem>
    </div>
  </Faq>
</Section>
<Hr classHr="my-8" />

<Section name="logos">
  <HeroHeader>
    <h2
      class="mb-8 text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white p-4 xl:px-4"
    >
      Our Tech Stack
    </h2>
    <div
      class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-4 lg:grid-cols-4 dark:text-gray-400 p-4 xl:px-4"
    >
      <a href="/" class="flex justify-center items-center">
        <img src="svelte.svg" class="h-10" />
      </a>
      <a href="/" class="flex justify-center items-center">
        <img src="nodejs.svg" class="h-15" />
      </a>
      <a href="/" class="flex justify-center items-center">
        <img src="mongodb.svg" class="h-20" />
      </a>
      <a href="/" class="flex justify-center items-center">
        <img src="expressjs.svg" class="h-20" />
      </a>
    </div>
  </HeroHeader>
</Section>

<Hr classHr="my-8" />

<Section name="team">
  <TeamWrapper>
    <TeamHeader>
      <svelte:fragment slot="label">Meet the Developer</svelte:fragment>
      <p
        class="font-light text-gray-500 lg:mb-16 sm:text-xl dark:text-gray-400 p-4 xl:px-4 rounded-3xl"
      >
        Temui Developer di balik Platform Aksara
      </p>
    </TeamHeader>
    <TeamBody class="text-center rounded-full p-4 xl:px-4">
      {#each members as { href, src, alt, name, jobTitle, description }}
        <TeamItem
          {href}
          {src}
          {alt}
          {name}
          {jobTitle}
          class=" grid grid-cols-1 text-left p-4 xl:px-4 rounded-4xl"
        >
          <p class="mt-3 mb-4 font-light text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </TeamItem>
      {/each}
    </TeamBody>
  </TeamWrapper>
</Section>

<Hr classHr="my-8" />

<Footerku />
<BotNav />