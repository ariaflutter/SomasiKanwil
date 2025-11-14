<script>
    // @ts-nocheck
  import "../app.css";
  import { BottomNav, BottomNavItem, Skeleton, ImagePlaceholder } from 'flowbite-svelte';
  import { HomeSolid, WalletSolid, AdjustmentsVerticalOutline, UserCircleSolid } from 'flowbite-svelte-icons';
  import { SearchOutline } from 'flowbite-svelte-icons';
  import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Dropdown, DropdownItem, DropdownDivider,TextPlaceholder } from 'flowbite-svelte';
  import { DarkMode } from 'flowbite-svelte';
  import { Banner, } from 'flowbite-svelte';
  import { BullhornSolid } from 'flowbite-svelte-icons';
  import { BottomNavHeader, BottomNavHeaderItem, Tooltip, } from 'flowbite-svelte';
  import { BookmarkSolid, PlusOutline,  } from 'flowbite-svelte-icons';
  import { ChevronDownOutline } from 'flowbite-svelte-icons';
  import { Heading, P, A, Mark, Secondary, GradientButton , Span, Hr,Footer, FooterBrand, FooterLinkGroup, FooterLink, FooterCopyright, FooterIcon } from 'flowbite-svelte';
  import { ArrowRightOutline } from 'flowbite-svelte-icons';
  import { Section } from 'flowbite-svelte-blocks';
  import { HeroHeader, FeatureDefault, FeatureItem } from "flowbite-svelte-blocks";
  import { ChartPieSolid, LandmarkSolid, BriefcaseSolid, DollarOutline, RocketSolid, CogOutline } from "flowbite-svelte-icons";
</script>

<Footer footerType="socialmedia">
    <div class="mx-auto max-w-screen-xl text-center pb-20">
      <FooterBrand href="/" src="../Logo.png" alt="Aksara Logo" name="Aksara Bapas Jember" aClass="flex justify-center items-center text-2xl font-semibold text-gray-900 dark:text-white" />
      <p class="my-6 text-gray-500 dark:text-gray-400">Aplikasi Kendali dan Supervisi Klien Pemasyarakatan - Sistem Informasi Inovasi Layanan Balai Pemasyarakatan Kelas II Jember</p>
      <FooterLinkGroup ulClass="flex flex-wrap justify-center items-center mb-6 text-gray-900 dark:text-white">
        <FooterLink liClass="" aClass="mr-4 hover:underline md:mr-6 text-primary-600" href="/">Tentang</FooterLink>
        <FooterLink liClass="" aClass="mr-4 hover:underline md:mr-6 text-primary-600" href="/">Reformasi Birokrasi</FooterLink>
        <FooterLink liClass="" aClass="mr-4 hover:underline md:mr-6 text-primary-600" href="/">Inovasi</FooterLink>
        <FooterLink liClass="" aClass="mr-4 hover:underline md:mr-6 text-primary-600" href="/">Login</FooterLink>
      </FooterLinkGroup>
      <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2022 <a href="https://www.instagram.com/gema.eka.adi.pamungkas/" class=" text-primary-600 hover:underline">Gema Eka Adi Pamungkas</a>. All Rights Reserved.</span>
    </div>
  </Footer>