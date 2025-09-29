<script>
  // @ts-ignore
  import { Router, Route } from "svelte-routing";
  // @ts-ignore
  import Tentang from "./components/Tentang.svelte";
  // @ts-ignore
  import Home from "./components/home.svelte";
  // @ts-ignore
  import Login from "./components/Login.svelte";
  // @ts-ignore
  import DashboardPetugas from "./components/DashboardPetugas.svelte";
  // @ts-ignore
  import DashboardKlien from "./components/DashboardKlien.svelte";
  // @ts-ignore
  import UploadData from "./components/UploadData.svelte";
  // @ts-ignore
  import StatusLitmas from "./components/StatusLitmas.svelte";
  // @ts-ignore
  import ListKlien from "./components/ListKlien.svelte";
  // @ts-ignore
  import WajibLapor from "./components/WajibLapor.svelte";
  // @ts-ignore
  import HalamanWajibLapor from "./components/HalamanWajibLapor.svelte";
  // @ts-ignore
  import WajibLaporToday from "./components/WajibLaporToday.svelte";
  // @ts-ignore
  import WajibLaporPetugas from "./components/WajibLaporPetugas.svelte";
  // @ts-ignore
  import LokasiWajibLapor from "./components/LokasiWajibLapor.svelte";
  // @ts-ignore
  import Show from "./components/Show.svelte";
  // @ts-ignore
  import Pokja1 from "./components/pokja1.svelte";
  // @ts-ignore
  import Pokja2 from "./components/pokja2.svelte";
  // @ts-ignore
  import Pokja3 from "./components/pokja3.svelte";
  // @ts-ignore
  import Pokja4 from "./components/pokja4.svelte";
  // @ts-ignore
  import Pokja5 from "./components/pokja5.svelte";
  // @ts-ignore
  import Pokja6 from "./components/pokja6.svelte";
  // @ts-ignore
  import Tutorial from "./components/tutorial.svelte";
  // @ts-ignore
  import Easteregg from "./components/easteregg.svelte";
  // @ts-ignore
  import Berita from "./components/Berita.svelte";
  // @ts-ignore
  import HalamanWajibLaporPetugas from "./components/HalamanWajibLaporPetugas.svelte";
    // @ts-ignore
  import KebijakanPrivasi from "./components/KebijakanPrivasi.svelte";
    // @ts-ignore
  import SemuaKlien from "./components/SemuaKlien.svelte";
// @ts-ignore
  import DetailKlien from "./components/DetailKlien.svelte";
// @ts-ignore
  import SelfService from "./components/SelfService.svelte";
  // @ts-ignore
  import Akane from "./components/Akane.svelte";
  // @ts-ignore
 import ChangePassword from "./components/ChangePassword.svelte";

</script>

<Router>
  <main>
    <Route path="/login" component={Login} />
    <Route path="/home" component={Home} />
    <Route path="/tentang" component={Tentang} />
    <Route path="/" component={Home} />
    <!-- Redirect to Login by default -->
    <Route path="/dashboard-petugas" component={DashboardPetugas} />
    <Route path="/dashboard-klien" component={DashboardKlien} />
    <Route path="/upload-data" component={UploadData} />
    <Route path="/status-litmas" component={StatusLitmas} />
    <Route path="/list-klien" component={ListKlien} />
    <Route path="/wajib-lapor" component={WajibLapor} />
    <Route path="/wajib-lapor/:id" component={HalamanWajibLapor} />
    <Route path="/wajib-lapor-petugas/:id" component={HalamanWajibLaporPetugas} />
    <Route path="/wajib-lapor-today" component={WajibLaporToday} />
    <Route path="/wajib-lapor-petugas" component={WajibLaporPetugas} />
    <Route path="/lokasi-wajib-lapor" component={LokasiWajibLapor} />
    <Route path="/show" component={Show} />
    <Route path="/pokja1" component={Pokja1} />
    <Route path="/pokja2" component={Pokja2} />
    <Route path="/pokja3" component={Pokja3} />
    <Route path="/pokja4" component={Pokja4} />
    <Route path="/pokja5" component={Pokja5} />
    <Route path="/pokja6" component={Pokja6} />
    <Route path="/tutorial" component={Tutorial} />
    <Route path="/easter-egg" component={Easteregg} />
    <Route path="/berita" component={Berita} />
    <Route path="/detail-klien/:id" component={DetailKlien} />
    <Route path='/change-password' component={ChangePassword} />
    <Route
      path="/halaman-wajib-lapor-petugas"
      component={HalamanWajibLaporPetugas}
    />
    <Route path="/kebijakan-privasi" component={KebijakanPrivasi} />
    <Route path="/list-semua-klien" component={SemuaKlien} />
    <Route path="/self-service" component={SelfService} />
    <Route path="/AkaneAI" component={Akane} />
  </main>
</Router>

<style>
  main {
    font-family: "Plus Jakarta Sans", sans-serif;
  }
</style>
