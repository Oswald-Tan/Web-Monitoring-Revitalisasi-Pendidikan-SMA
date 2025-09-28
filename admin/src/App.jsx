import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import LupaPassword from "./pages/LupaPassword";
import NotFound from "./components/404";

import LayoutSuperAdmin from "./layout/LayoutSuperAdmin";
import DashboarSuperAdmin from "./pages/SuperAdmin/Dashboard";
import DaftarSekolah from "./pages/SuperAdmin/DaftarSekolah";
import DetailSekolah from "./pages/SuperAdmin/DetailSekolah";
import InputHarian from "./pages/SuperAdmin/InputanHarian";
import ReviuMingguan from "./pages/SuperAdmin/ReviuMingguan";
import LaporanBulanan from "./pages/SuperAdmin/LaporanBulanan";
import LaporanAkhir from "./pages/SuperAdmin/LaporanAkhir";
import KalenderKegiatan from "./pages/SuperAdmin/KalenderKegiatan";
import ForumDiskusi from "./pages/SuperAdmin/ForumDiskusi";
import TemplateSOP from "./pages/SuperAdmin/TemplateSOP";
import ArsipRegulasi from "./pages/SuperAdmin/ArsipRegulasi";
import ProfilePersonel from "./pages/SuperAdmin/ProfilePersonel";
import PembagianTugas from "./pages/SuperAdmin/PembagianTugas";
import ProfileAkun from "./pages/SuperAdmin/ProfileAkun";
import HakAkses from "./pages/SuperAdmin/HakAkses";
import AddUser from "./pages/SuperAdmin/AddUser";
import EditUser from "./pages/SuperAdmin/EditUser";
import AddSchool from "./pages/SuperAdmin/AddSchool";
import Contact from "./pages/SuperAdmin/Contact";

import LayoutAdminSekolah from "./layout/LayoutAdminSekolah";
import DashboarAdminSekolah from "./pages/AdminSekolah/Dashboard";
import ProfileAkunAdminSekolah from "./pages/AdminSekolah/ProfileAkun";
import EditSchool from "./pages/SuperAdmin/EditSchool";
import ThreadDetail from "./pages/SuperAdmin/ForumDiskusi/ThreadDetail";
import DaftarSekolahAdminSekolah from "./pages/AdminSekolah/DaftarSekolah";
import DetailSekolahAdminSekolah from "./pages/AdminSekolah/DetailSekolah";

import LayoutAdminPusat from "./layout/LayoutAdminPusat";
import DashboarAdminPusat from "./pages/AdminPusat/Dashboard";
import DaftarSekolahAdminPusat from "./pages/AdminPusat/DaftarSekolah";
import AddSchoolAdminPusat from "./pages/AdminPusat/AddSchool";
import EditSchoolAdminPusat from "./pages/AdminPusat/EditSchool";
import DetailSekolahAdminPusat from "./pages/AdminPusat/DetailSekolah";
import InputHarianAdminPusat from "./pages/AdminPusat/InputanHarian";
import ReviuMingguanAdminPusat from "./pages/AdminPusat/ReviuMingguan";
import LaporanBulananAdminPusat from "./pages/AdminPusat/LaporanBulanan";
import LaporanAkhirAdminPusat from "./pages/AdminPusat/LaporanAkhir";
import KalenderKegiatanAdminPusat from "./pages/AdminPusat/KalenderKegiatan";
import ForumDiskusiAdminPusat from "./pages/AdminPusat/ForumDiskusi";
import ThreadDetailAdminPusat from "./pages/AdminPusat/ForumDiskusi/ThreadDetail";
import TemplateSOPAdminPusat from "./pages/AdminPusat/TemplateSOP";
import ArsipRegulasiAdminPusat from "./pages/AdminPusat/ArsipRegulasi";
import ProfilPersonelAdminPusat from "./pages/AdminPusat/ProfilePersonel";
import PembagianTugasAdminPusat from "./pages/AdminPusat/PembagianTugas";
import ProfileAkunAdminPusat from "./pages/AdminPusat/ProfileAkun";
import HakAksesAdminPusat from "./pages/AdminPusat/HakAkses";
import AddUserAdminPusat from "./pages/AdminPusat/AddUser";
import EditUserAdminPusat from "./pages/AdminPusat/EditUser";

import LayoutFasilitator from "./layout/LayoutFasilitator";
import DashboarFasilitator from "./pages/Fasilitator/Dashboard";
import DaftarSekolahFasilitator from "./pages/Fasilitator/DaftarSekolah";
import AddSchoolFasilitator from "./pages/Fasilitator/AddSchool";
import EditSchoolFasilitator from "./pages/Fasilitator/EditSchool";
import DetailSekolahFasilitator from "./pages/Fasilitator/DetailSekolah";
import InputHarianFasilitator from "./pages/Fasilitator/InputanHarian";
import ReviuMingguanFasilitator from "./pages/Fasilitator/ReviuMingguan";
import LaporanBulananFasilitator from "./pages/Fasilitator/LaporanBulanan";
import LaporanAkhirFasilitator from "./pages/Fasilitator/LaporanAkhir";
import KalenderKegiatanFasilitator from "./pages/Fasilitator/KalenderKegiatan";
import ForumDiskusiFasilitator from "./pages/Fasilitator/ForumDiskusi";
import ThreadDetailFasilitator from "./pages/Fasilitator/ForumDiskusi/ThreadDetail";
import TemplateSOPFasilitator from "./pages/Fasilitator/TemplateSOP";
import ArsipRegulasiFasilitator from "./pages/Fasilitator/ArsipRegulasi";
import ProfilPersonelFasilitator from "./pages/Fasilitator/ProfilePersonel";
import PembagianTugasFasilitator from "./pages/Fasilitator/PembagianTugas";
import ProfileAkunFasilitator from "./pages/Fasilitator/ProfileAkun";
import HakAksesFasilitator from "./pages/Fasilitator/HakAkses";
import AddUserFasilitator from "./pages/Fasilitator/AddUser";

import LayoutKoordinator from "./layout/LayoutKoordinator";
import DashboarKoordinator from "./pages/Koordinator/Dashboard";
import DaftarSekolahKoordinator from "./pages/Koordinator/DaftarSekolah";
import AddSchoolKoordinator from "./pages/Koordinator/AddSchool";
import EditSchoolKoordinator from "./pages/Koordinator/EditSchool";
import DetailSekolahKoordinator from "./pages/Koordinator/DetailSekolah";
import InputHarianKoordinator from "./pages/Koordinator/InputanHarian";
import ReviuMingguanKoordinator from "./pages/Koordinator/ReviuMingguan";
import LaporanBulananKoordinator from "./pages/Koordinator/LaporanBulanan";
import LaporanAkhirKoordinator from "./pages/Koordinator/LaporanAkhir";
import KalenderKegiatanKoordinator from "./pages/Koordinator/KalenderKegiatan";
import ForumDiskusiKoordinator from "./pages/Koordinator/ForumDiskusi";
import ThreadDetailKoordinator from "./pages/Koordinator/ForumDiskusi/ThreadDetail";
import TemplateSOPKoordinator from "./pages/Koordinator/TemplateSOP";
import ArsipRegulasiKoordinator from "./pages/Koordinator/ArsipRegulasi";
import ProfilPersonelKoordinator from "./pages/Koordinator/ProfilePersonel";
import PembagianTugasKoordinator from "./pages/Koordinator/PembagianTugas";
import ProfileAkunKoordinator from "./pages/Koordinator/ProfileAkun";
import HakAksesKoordinator from "./pages/Koordinator/HakAkses";
import AddUserKoordinator from "./pages/Koordinator/AddUser";
import InputHarianReviewKoordinator from "./pages/Koordinator/InputanHarianReview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/forgot/password" element={<LupaPassword />} />

        {/* Super Admin */}
        <Route element={<LayoutSuperAdmin />}>
          <Route
            path="/super-admin/dashboard"
            element={<DashboarSuperAdmin />}
          />

          <Route path="/super-admin/sekolah" element={<DaftarSekolah />} />
          <Route path="/super-admin/sekolah/add" element={<AddSchool />} />
          <Route
            path="/super-admin/sekolah/edit/:id"
            element={<EditSchool />}
          />
          <Route
            path="/super-admin/sekolah/detail/:id"
            element={<DetailSekolah />}
          />

          <Route
            path="/super-admin/monitoring/input-harian"
            element={<InputHarian />}
          />
          <Route
            path="/super-admin/monitoring/reviu-mingguan"
            element={<ReviuMingguan />}
          />
          <Route
            path="/super-admin/pelaporan/laporan-bulanan"
            element={<LaporanBulanan />}
          />
          <Route
            path="/super-admin/pelaporan/laporan-akhir"
            element={<LaporanAkhir />}
          />

          <Route
            path="/super-admin/koordinasi/kalender-kegiatan"
            element={<KalenderKegiatan />}
          />
          <Route path="/super-admin/forum-diskusi" element={<ForumDiskusi />} />
          <Route
            path="/super-admin/discussion/:id"
            element={<ThreadDetail />}
          />

          <Route
            path="/super-admin/dokumen/template-sop"
            element={<TemplateSOP />}
          />
          <Route
            path="/super-admin/dokumen/arsip-regulasi"
            element={<ArsipRegulasi />}
          />

          <Route
            path="/super-admin/manajemen-tim/profil-personel"
            element={<ProfilePersonel />}
          />
          <Route
            path="/super-admin/manajemen-tim/pembagian-tugas"
            element={<PembagianTugas />}
          />

          <Route
            path="/super-admin/pengaturan/profil-akun"
            element={<ProfileAkun />}
          />
          <Route
            path="/super-admin/pengaturan/hak-akses"
            element={<HakAkses />}
          />
          <Route path="/super-admin/user/add" element={<AddUser />} />
          <Route path="/super-admin/user/edit/:id" element={<EditUser />} />
          <Route path="/super-admin/contact" element={<Contact />} />
        </Route>

        {/* Admin Pusat */}
        <Route element={<LayoutAdminPusat />}>
          <Route
            path="/admin-pusat/dashboard"
            element={<DashboarAdminPusat />}
          />

          <Route path="/admin-pusat/sekolah" element={<DaftarSekolahAdminPusat />} />
          <Route path="/admin-pusat/sekolah/add" element={<AddSchoolAdminPusat />} />
          <Route
            path="/admin-pusat/sekolah/edit/:id"
            element={<EditSchoolAdminPusat />}
          />
          <Route
            path="/admin-pusat/sekolah/detail/:id"
            element={<DetailSekolahAdminPusat />}
          />

          <Route
            path="/admin-pusat/monitoring/input-harian"
            element={<InputHarianAdminPusat />}
          />
          <Route
            path="/admin-pusat/monitoring/reviu-mingguan"
            element={<ReviuMingguanAdminPusat />}
          />
          <Route
            path="/admin-pusat/pelaporan/laporan-bulanan"
            element={<LaporanBulananAdminPusat />}
          />
          <Route
            path="/admin-pusat/pelaporan/laporan-akhir"
            element={<LaporanAkhirAdminPusat />}
          />

          <Route
            path="/admin-pusat/koordinasi/kalender-kegiatan"
            element={<KalenderKegiatanAdminPusat />}
          />
          <Route path="/admin-pusat/forum-diskusi" element={<ForumDiskusiAdminPusat />} />
          <Route
            path="/admin-pusat/discussion/:id"
            element={<ThreadDetailAdminPusat />}
          />

          <Route
            path="/admin-pusat/dokumen/template-sop"
            element={<TemplateSOPAdminPusat />}
          />
          <Route
            path="/admin-pusat/dokumen/arsip-regulasi"
            element={<ArsipRegulasiAdminPusat />}
          />

          <Route
            path="/admin-pusat/manajemen-tim/profil-personel"
            element={<ProfilPersonelAdminPusat />}
          />
          <Route
            path="/admin-pusat/manajemen-tim/pembagian-tugas"
            element={<PembagianTugasAdminPusat />}
          />

          <Route
            path="/admin-pusat/pengaturan/profil-akun"
            element={<ProfileAkunAdminPusat />}
          />
          <Route
            path="/admin-pusat/pengaturan/hak-akses"
            element={<HakAksesAdminPusat />}
          />
          <Route path="/admin-pusat/user/add" element={<AddUserAdminPusat />} />
          <Route path="/admin-pusat/user/edit/:id" element={<EditUserAdminPusat />} />
        </Route>

        {/* Fasilitator */}
        <Route element={<LayoutFasilitator />}>
          <Route
            path="/fasilitator/dashboard"
            element={<DashboarFasilitator />}
          />

          <Route path="/fasilitator/sekolah" element={<DaftarSekolahFasilitator />} />
          <Route path="/fasilitator/sekolah/add" element={<AddSchoolFasilitator />} />
          <Route
            path="/fasilitator/sekolah/edit/:id"
            element={<EditSchoolFasilitator />}
          />
          <Route
            path="/fasilitator/sekolah/detail/:id"
            element={<DetailSekolahFasilitator />}
          />

          <Route
            path="/fasilitator/monitoring/input-harian"
            element={<InputHarianFasilitator />}
          />
          <Route
            path="/fasilitator/monitoring/reviu-mingguan"
            element={<ReviuMingguanFasilitator />}
          />
          <Route
            path="/fasilitator/pelaporan/laporan-bulanan"
            element={<LaporanBulananFasilitator />}
          />
          <Route
            path="/fasilitator/pelaporan/laporan-akhir"
            element={<LaporanAkhirFasilitator />}
          />

          <Route
            path="/fasilitator/koordinasi/kalender-kegiatan"
            element={<KalenderKegiatanFasilitator />}
          />
          <Route path="/fasilitator/forum-diskusi" element={<ForumDiskusiFasilitator />} />
          <Route
            path="/fasilitator/discussion/:id"
            element={<ThreadDetailFasilitator />}
          />

          <Route
            path="/fasilitator/dokumen/template-sop"
            element={<TemplateSOPFasilitator />}
          />
          <Route
            path="/fasilitator/dokumen/arsip-regulasi"
            element={<ArsipRegulasiFasilitator />}
          />

          <Route
            path="/fasilitator/manajemen-tim/profil-personel"
            element={<ProfilPersonelFasilitator />}
          />
          <Route
            path="/fasilitator/manajemen-tim/pembagian-tugas"
            element={<PembagianTugasFasilitator />}
          />

          <Route
            path="/fasilitator/pengaturan/profil-akun"
            element={<ProfileAkunFasilitator />}
          />
          <Route
            path="/fasilitator/pengaturan/hak-akses"
            element={<HakAksesFasilitator />}
          />
          <Route path="/fasilitator/user/add" element={<AddUserFasilitator />} />
          <Route path="/fasilitator/user/edit/:id" element={<EditSchoolFasilitator />} />
        </Route>

        {/* Koordinator */}
        <Route element={<LayoutKoordinator />}>
          <Route
            path="/koordinator/dashboard"
            element={<DashboarKoordinator />}
          />

          <Route path="/koordinator/sekolah" element={<DaftarSekolahKoordinator />} />
          <Route path="/koordinator/sekolah/add" element={<AddSchoolKoordinator />} />
          <Route
            path="/koordinator/sekolah/edit/:id"
            element={<EditSchoolKoordinator />}
          />
          <Route
            path="/koordinator/sekolah/detail/:id"
            element={<DetailSekolahKoordinator />}
          />

          <Route
            path="/koordinator/monitoring/input-harian"
            element={<InputHarianKoordinator />}
          />
          <Route
            path="/koordinator/monitoring/input-harian-review"
            element={<InputHarianReviewKoordinator />}
          />
          <Route
            path="/koordinator/monitoring/reviu-mingguan"
            element={<ReviuMingguanKoordinator />}
          />
          <Route
            path="/koordinator/pelaporan/laporan-bulanan"
            element={<LaporanBulananKoordinator />}
          />
          <Route
            path="/koordinator/pelaporan/laporan-akhir"
            element={<LaporanAkhirKoordinator />}
          />

          <Route
            path="/koordinator/koordinasi/kalender-kegiatan"
            element={<KalenderKegiatanKoordinator />}
          />
          <Route path="/koordinator/forum-diskusi" element={<ForumDiskusiKoordinator />} />
          <Route
            path="/koordinator/discussion/:id"
            element={<ThreadDetailKoordinator />}
          />

          <Route
            path="/koordinator/dokumen/template-sop"
            element={<TemplateSOPKoordinator />}
          />
          <Route
            path="/koordinator/dokumen/arsip-regulasi"
            element={<ArsipRegulasiKoordinator />}
          />

          <Route
            path="/koordinator/manajemen-tim/profil-personel"
            element={<ProfilPersonelKoordinator />}
          />
          <Route
            path="/koordinator/manajemen-tim/pembagian-tugas"
            element={<PembagianTugasKoordinator />}
          />

          <Route
            path="/koordinator/pengaturan/profil-akun"
            element={<ProfileAkunKoordinator />}
          />
          <Route
            path="/koordinator/pengaturan/hak-akses"
            element={<HakAksesKoordinator />}
          />
          <Route path="/koordinator/user/add" element={<AddUserKoordinator />} />
          <Route path="/koordinator/user/edit/:id" element={<EditSchoolKoordinator />} />
        </Route>

        {/* Admin Sekolah */}
        <Route element={<LayoutAdminSekolah />}>
          <Route
            path="/admin-sekolah/dashboard"
            element={<DashboarAdminSekolah />}
          />
          <Route
            path="/admin-sekolah/sekolah"
            element={<DaftarSekolahAdminSekolah />}
          />
          <Route
            path="/admin-sekolah/detail/sekolah/:id"
            element={<DetailSekolahAdminSekolah />}
          />
          <Route
            path="/admin-sekolah/profil-akun"
            element={<ProfileAkunAdminSekolah />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
