<script>
  // @ts-nocheck
  import Nav from "./Nav.svelte";
  import BotNav from "./BotNav.svelte";
  import Footerku from "./footerku.svelte";
  import { Section, ContentWithImage } from "flowbite-svelte-blocks";
  import { Hr } from "flowbite-svelte";
  import { Blockquote } from "flowbite-svelte";
  import { QuoteSolid } from "flowbite-svelte-icons";
  import { Heading, P, A } from "flowbite-svelte";
  import { ChevronRightOutline } from "flowbite-svelte-icons";
  import {
    HeroHeader,
    FeatureDefault,
    FeatureItem,
  } from "flowbite-svelte-blocks";
  import {
    ChartPieSolid,
    ClockSolid,
    BriefcaseSolid,
    DollarOutline,
    RocketSolid,
    CogOutline,
  } from "flowbite-svelte-icons";
  import { Faq, FaqItem } from "flowbite-svelte-blocks";
  import {
    TeamWrapper,
    TeamHeader,
    TeamBody,
    TeamItem,
    Facebook,
    Github,
    Twitter,
  } from "flowbite-svelte-blocks";
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
<div class="mt-10 text-left w-screen max-w-screen-xl">
  <header class=" text-grey-600 py-6">
    <div class="container mx-auto text-center">
      <h1 class="text-3xl font-semibold">Kebijakan Privasi</h1>
      <p class="text-lg">Balai Pemasyarakatan Kelas II Jember</p>
    </div>
  </header>

  <main class="container mx-auto px-4 py-8">
    <section class="bg-white shadow-lg rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Privacy Policy (English)
      </h2>
      <p class="text-gray-700 mb-4">
        This Privacy Policy explains how the Wajib Lapor Balai Pemasyarakatan
        Kelas II Jember collects, uses, and manages your data. By using this
        service, you agree to the collection and use of your data as described
        below.
      </p>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">1. Data We Collect</h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Personal Data:</strong> Name, address, identification number,
            phone number, etc.
          </li>
          <li>
            <strong>Activity Data:</strong> Reporting time, location, and purpose
            of reporting.
          </li>
          <li>
            <strong>Technical Data:</strong> IP address, device information, and
            usage logs.
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">2. Use of Data</h3>
        <p class="text-gray-700">We use the collected data for:</p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Processing and recording mandatory reports.</li>
          <li>
            Managing communication between users and the correctional facility.
          </li>
          <li>
            Ensuring compliance with legal regulations, including the Personal
            Data Protection Law (UU PDP).
          </li>
          <li>Improving the quality of our services.</li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">3. Data Security</h3>
        <p class="text-gray-700">
          We take reasonable technical and organizational measures to protect
          your data from unauthorized access, misuse, or loss, in compliance
          with the Personal Data Protection Law (UU PDP).
        </p>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">4. Consent</h3>
        <p class="text-gray-700">
          By using this service, you acknowledge that you have read, understood,
          and agreed to this Privacy Policy and the principles set forth in the
          Personal Data Protection Law (UU PDP).
        </p>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">5. Your Rights</h3>
        <p class="text-gray-700">
          As part of the Personal Data Protection Law (UU PDP), you have the
          right to:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Access your personal data.</li>
          <li>Correct or update inaccurate data.</li>
          <li>Withdraw consent at any time for the processing of your data.</li>
          <li>
            File a complaint with the relevant authorities if you believe your
            data has been processed improperly.
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">6. Contact Us</h3>
        <p class="text-gray-700">
          If you have any questions or concerns about this Privacy Policy, or
          wish to exercise any of your rights under the Personal Data Protection
          Law (UU PDP), feel free to contact us:
        </p>
        <address class="text-gray-700">
          <strong>Balai Pemasyarakatan Kelas II Jember</strong><br />
          Jl. Jawa No.34, Tegal Boto Lor, Sumbersari, Kec. Sumbersari, Kabupaten
          Jember, Jawa Timur 68121<br />
          balai.pemasyarakatan.jember@gmail.com
        </address>
      </div>
    </section>

    <!-- Kebijakan Privasi Bahasa Indonesia -->
    <section class="bg-white shadow-lg rounded-lg p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">
        Kebijakan Privasi (Bahasa Indonesia)
      </h2>
      <p class="text-gray-700 mb-4">
        Kebijakan Privasi ini menjelaskan bagaimana Wajib Lapor Balai
        Pemasyarakatan Kelas II Jember mengumpulkan, menggunakan, dan mengelola
        data Anda. Dengan menggunakan layanan ini, Anda menyetujui pengumpulan
        dan penggunaan data Anda seperti yang dijelaskan di bawah ini.
      </p>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">
          1. Data yang Dikumpulkan
        </h3>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>
            <strong>Data Pribadi:</strong> Nama, alamat, nomor identitas, nomor telepon,
            dll.
          </li>
          <li>
            <strong>Data Aktivitas:</strong> Waktu pelaporan, lokasi, dan tujuan
            pelaporan.
          </li>
          <li>
            <strong>Data Teknis:</strong> Alamat IP, informasi perangkat, dan log
            penggunaan.
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">2. Penggunaan Data</h3>
        <p class="text-gray-700">
          Kami menggunakan data yang dikumpulkan untuk:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Memproses dan mencatat laporan wajib lapor.</li>
          <li>
            Mengelola komunikasi antara pengguna dan Balai Pemasyarakatan.
          </li>
          <li>
            Memastikan kepatuhan terhadap peraturan hukum yang berlaku, termasuk
            **Undang-Undang Perlindungan Data Pribadi (UU PDP)**.
          </li>
          <li>Meningkatkan kualitas layanan kami.</li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">3. Keamanan Data</h3>
        <p class="text-gray-700">
          Kami mengambil langkah teknis dan organisasi yang wajar untuk
          melindungi data Anda dari akses yang tidak sah, penyalahgunaan, atau
          kehilangan, sesuai dengan ketentuan **Undang-Undang Perlindungan Data
          Pribadi (UU PDP)**.
        </p>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">4. Persetujuan</h3>
        <p class="text-gray-700">
          Dengan menggunakan layanan ini, Anda mengakui bahwa Anda telah
          membaca, memahami, dan menyetujui Kebijakan Privasi ini serta
          prinsip-prinsip yang diatur dalam **Undang-Undang Perlindungan Data
          Pribadi (UU PDP)**.
        </p>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">5. Hak Anda</h3>
        <p class="text-gray-700">
          Sebagai bagian dari **Undang-Undang Perlindungan Data Pribadi (UU
          PDP)**, Anda memiliki hak untuk:
        </p>
        <ul class="list-disc pl-6 space-y-2 text-gray-700">
          <li>Mengakses data pribadi Anda.</li>
          <li>Memperbaiki atau memperbarui data yang tidak akurat.</li>
          <li>Menarik persetujuan kapan saja terkait pemrosesan data Anda.</li>
          <li>
            Mengajukan keluhan kepada otoritas yang berwenang jika Anda merasa
            data Anda diproses secara tidak benar.
          </li>
        </ul>
      </div>

      <div class="mb-6">
        <h3 class="text-lg font-semibold text-gray-800">6. Hubungi Kami</h3>
        <p class="text-gray-700">
          Jika Anda memiliki pertanyaan atau kekhawatiran terkait Kebijakan
          Privasi ini, atau ingin menjalankan hak Anda sesuai **Undang-Undang
          Perlindungan Data Pribadi (UU PDP)**, silakan hubungi kami:
        </p>
        <address class="text-gray-700">
          <strong>Balai Pemasyarakatan Kelas II Jember</strong><br />
          Jl. Jawa No.34, Tegal Boto Lor, Sumbersari, Kec. Sumbersari, Kabupaten
          Jember, Jawa Timur 68121<br />
          balai.pemasyarakatan.jember@gmail.com
        </address>
      </div>
    </section>
  </main>
</div>
<Footerku />
<BotNav />
