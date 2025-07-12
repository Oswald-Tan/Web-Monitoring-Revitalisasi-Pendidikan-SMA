import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import LupaPassword from "./pages/LupaPassword";
import NotFound from "./components/404";

import AdminLayout from "./layout/LayoutAdmin";

import Dashboard from "./pages/Dashboard";
import DaftarSekolah from "./pages/Sekolah/DaftarSekolah";
import DetailSekolah from "./pages/Sekolah/DetailSekolah";
import InputHarian from "./pages/Monitoring/InputanHarian";
import ReviuMingguan from "./pages/Monitoring/ReviuMingguan";
import LaporanBulanan from "./pages/Pelaporan/LaporanBulanan";
import LaporanAkhir from "./pages/Pelaporan/LaporanAkhir";
import KalenderKegiatan from "./pages/Koordinasi/KalenderKegiatan";
import ForumDiskusi from "./pages/Koordinasi/ForumDiskusi";
import TemplateSOP from "./pages/Dokumen/TemplateSOP";
import ArsipRegulasi from "./pages/Dokumen/ArsipRegulasi";
import ProfilPersonel from "./pages/ManajemenTim/ProfilePersonel";
import PembagianTugas from "./pages/ManajemenTim/PembagianTugas";
import ProfilAkun from "./pages/Pengaturan/ProfileAkun";
import HakAkses from "./pages/Pengaturan/HakAkses";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot/password" element={<LupaPassword />} />

        {/* Admin Jurusan Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sekolah/daftar-sekolah" element={<DaftarSekolah />} />
          <Route path="/sekolah/detail-sekolah" element={<DetailSekolah />} />
          <Route path="/monitoring/input-harian" element={<InputHarian />} />
          <Route
            path="/monitoring/reviu-mingguan"
            element={<ReviuMingguan />}
          />
          <Route
            path="/pelaporan/laporan-bulanan"
            element={<LaporanBulanan />}
          />
          <Route path="/pelaporan/laporan-akhir" element={<LaporanAkhir />} />
          <Route
            path="/koordinasi/kalender-kegiatan"
            element={<KalenderKegiatan />}
          />
          <Route path="/koordinasi/forum-diskusi" element={<ForumDiskusi />} />
          <Route path="/dokumen/template-sop" element={<TemplateSOP />} />
          <Route path="/dokumen/arsip-regulasi" element={<ArsipRegulasi />} />
          <Route
            path="/manajemen-tim/profil-personel"
            element={<ProfilPersonel />}
          />
          <Route
            path="/manajemen-tim/pembagian-tugas"
            element={<PembagianTugas />}
          />
          <Route path="/pengaturan/profil-akun" element={<ProfilAkun />} />
          <Route path="/pengaturan/hak-akses" element={<HakAkses />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
