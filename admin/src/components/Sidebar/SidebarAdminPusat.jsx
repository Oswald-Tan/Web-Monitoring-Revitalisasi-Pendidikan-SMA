import React, { useEffect, useState } from "react";
import { RiFileCopy2Line } from "react-icons/ri";
import { TbLayoutDashboard } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";
import {
  LuMonitor,
  LuList,
  LuSchool,
  LuSunMedium,
  LuMoon,
  LuSettings,
} from "react-icons/lu";
import { BiGroup } from "react-icons/bi";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useSidebar } from "../../context/useSidebar";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import { LogOut, reset } from "../../features/authSlice";
import Swal from "sweetalert2";

const SidebarAdminPusat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Untuk mendapatkan path saat ini
  const { user } = useSelector((state) => state.auth);
  const { open, toggleSidebar } = useSidebar();
  const [menus, setMenus] = useState([]);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const [activeMenu, setActiveMenu] = useState(""); // Menu utama yang aktif
  const [activeSubMenuItem, setActiveSubMenuItem] = useState(""); // Submenu yang aktif

  // Tutup semua submenu saat sidebar ditutup
  useEffect(() => {
    if (!open) {
      setActiveSubMenu("");
    }
  }, [open]);

  // Deteksi path saat ini dan atur menu aktif
  useEffect(() => {
    const currentPath = location.pathname;

    // Cari menu utama yang aktif
    const findActiveMenu = () => {
      for (const menu of menus) {
        if (menu.hasSubMenu) {
          const foundSub = menu.subMenu.find((sub) => sub.link === currentPath);
          if (foundSub) {
            setActiveMenu(menu.name);
            // Hanya buka submenu jika sidebar terbuka
            if (open) {
              setActiveSubMenu(menu.name);
            }
            setActiveSubMenuItem(foundSub.name);
            return;
          }
        } else if (menu.link === currentPath) {
          setActiveMenu(menu.name);
          return;
        }
      }
    };

    findActiveMenu();
  }, [location.pathname, menus, open]);

  useEffect(() => {
    // Menu untuk admin jurusan
    const updatedMenus = [
      {
        name: "Dashboard",
        link: "/admin-pusat/dashboard",
        icon: TbLayoutDashboard,
      },
      {
        name: "Sekolah",
        link: "/admin-pusat/sekolah",
        icon: LuSchool,
      },
      {
        name: "Monitoring",
        icon: LuMonitor,
        hasSubMenu: true,
        subMenu: [
          { name: "Input Harian", link: "/admin-pusat/monitoring/input-harian" },
          { name: "Reviu Mingguan", link: "/admin-pusat/monitoring/reviu-mingguan" },
        ],
      },
      {
        name: "Pelaporan",
        icon: LuList,
        hasSubMenu: true,
        subMenu: [
          { name: "Laporan Bulanan", link: "/admin-pusat/pelaporan/laporan-bulanan" },
          { name: "Laporan Akhir", link: "/admin-pusat/pelaporan/laporan-akhir" },
        ],
      },
      {
        name: "Koordinasi",
        icon: HiOutlineDocumentText,
        hasSubMenu: true,
        subMenu: [
          {
            name: "Kalender Kegiatan",
            link: "/admin-pusat/koordinasi/kalender-kegiatan",
          },
          { name: "Forum Diskusi", link: "/admin-pusat/forum-diskusi" },
        ],
      },
      {
        name: "Dokumen",
        link: "/admin-pusat/dokumen/template-sop",
        icon: RiFileCopy2Line,
      },
      {
        name: "Manajemen Tim",
        hasSubMenu: true,
        subMenu: [
          {
            name: "Profile Personel",
            link: "/admin-pusat/manajemen-tim/profil-personel",
          },
          { name: "Pembagian Tugas", link: "/admin-pusat/manajemen-tim/pembagian-tugas" },
        ],
        icon: BiGroup,
      },
      {
        name: "Pengaturan Akun",
        hasSubMenu: true,
        subMenu: [
          { name: "Profil Akun", link: "/admin-pusat/pengaturan/profil-akun" },
          { name: "Hak Akses", link: "/admin-pusat/pengaturan/hak-akses" },
        ],
        icon: LuSettings,
      },
      {
        name: "Logout",
        action: () => logout(),
        icon: FiLogOut,
      },
    ];

    setMenus(updatedMenus);
  }, []);

  // Fungsi logout sederhana tanpa backend
  const logout = async () => {
    Swal.fire({
      title: "Konfirmasi Logout",
      text: "Apakah Anda yakin ingin logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Logout",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(LogOut());
        dispatch(reset());
        navigate("/");
      }
    });
  };

  const handleSubMenuClick = (menuName) => {
    if (!open) {
      toggleSidebar();
      setTimeout(() => {
        setActiveSubMenu(menuName);
      }, 300);
    } else {
      setActiveSubMenu(activeSubMenu === menuName ? "" : menuName);
    }
  };

  const handleMenuClick = (menu) => {
    // Jika menu memiliki aksi khusus (seperti toggle dark mode)
    if (menu.action) {
      menu.action();
      setActiveSubMenu(""); // Tutup submenu
      setActiveSubMenuItem(""); // Reset submenu item aktif
      return;
    }

    // Jika menu memiliki submenu
    if (menu.hasSubMenu) {
      handleSubMenuClick(menu.name);
      setActiveMenu(menu.name);
    }
    // Jika menu biasa tanpa submenu
    else if (menu.link) {
      setActiveMenu(menu.name);
      setActiveSubMenu(""); // Tutup submenu
      setActiveSubMenuItem(""); // Reset submenu item aktif
      navigate(menu.link);
    }
  };

  const handleSubMenuItemClick = (menuName, subItemName, link) => {
    setActiveMenu(menuName);
    setActiveSubMenuItem(subItemName);
    navigate(link);

    // Jika sidebar dalam keadaan tertutup (mobile), tutup setelah memilih submenu
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <>
      {open && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-10 md:hidden"
        />
      )}

      <section className="flex gap-6 relative">
        <div
          className={`bg-[#121212] border-r border-[#282828] min-h-screen ${
            open
              ? "w-[280px]"
              : "md:w-[68px] md:translate-x-0 -translate-x-[280px]"
          } fixed top-0 left-0 z-20 duration-500 text-gray-100 px-4 overflow-y-auto flex flex-col`}
          style={{ height: "100vh" }}
        >
          <div>
            <div className="py-4 px-2 flex relative">
              <h2
                className={`whitespace-pre duration-1000 text-xl font-semibold ${
                  !open && "-translate-x-[280px] opacity-0"
                }`}
              >
                Admin Pusat
              </h2>
              <FaHouse
                size={19}
                className={`absolute left-[6px] w-6 overflow-hidden duration-300 transition-opacity ${
                  open ? "opacity-0 delay-0" : "opacity-100 delay-500"
                }`}
              />
            </div>

            <div className="mt-2 flex flex-col gap-1 relative">
              {menus.map((menu, i) => {
                const isMenuActive = activeMenu === menu.name;

                if (menu.hasSubMenu) {
                  return (
                    <div key={i} className="">
                      <button
                        onClick={() => handleMenuClick(menu)}
                        className={`group flex items-center justify-between w-full text-sm gap-3.5 font-medium px-2 py-3 rounded-xl text-left ${
                          isMenuActive
                            ? "bg-[#3A3A3A] text-white"
                            : "hover:bg-[#282828]"
                        }`}
                      >
                        <div className="flex items-center">
                          <div>
                            {React.createElement(menu.icon, { size: "20" })}
                          </div>
                          <h2
                            style={{
                              transitionDelay: `${i + 3}00ms`,
                            }}
                            className={`whitespace-pre duration-500 ml-3 ${
                              !open &&
                              "opacity-0 translate-x-28 overflow-hidden"
                            }`}
                          >
                            {menu.name}
                          </h2>
                        </div>
                        <div className={`${!open ? "hidden" : "block"}`}>
                          {activeSubMenu === menu.name ? (
                            <MdKeyboardArrowUp size={14} />
                          ) : (
                            <MdKeyboardArrowDown size={14} />
                          )}
                        </div>
                      </button>

                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          activeSubMenu === menu.name ? "max-h-40" : "max-h-0"
                        }`}
                      >
                        <div className="pl-8 py-1 space-y-1">
                          {menu.subMenu.map((sub, j) => {
                            const isSubItemActive =
                              activeSubMenuItem === sub.name;
                            return (
                              <button
                                key={j}
                                onClick={() =>
                                  handleSubMenuItemClick(
                                    menu.name,
                                    sub.name,
                                    sub.link
                                  )
                                }
                                className={`flex items-center w-full text-sm gap-3.5 font-medium px-2 py-2 rounded-lg transition-colors duration-200 ${
                                  isSubItemActive
                                    ? "text-white bg-[#3A3A3A]"
                                    : "text-gray-400 hover:bg-[#282828] hover:text-white"
                                }`}
                              >
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <h2
                                  style={{
                                    transitionDelay: `${j + 3}00ms`,
                                  }}
                                  className={`whitespace-pre duration-500 ${
                                    !open &&
                                    "opacity-0 translate-x-28 overflow-hidden"
                                  }`}
                                >
                                  {sub.name}
                                </h2>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                return menu.action ? (
                  <button
                    key={i}
                    onClick={() => handleMenuClick(menu)}
                    className={`group flex items-center text-sm gap-3.5 font-medium px-2 py-3 rounded-xl w-full text-left ${
                      isMenuActive
                        ? "bg-[#3A3A3A] text-white"
                        : "hover:bg-[#282828]"
                    }`}
                  >
                    <div>{React.createElement(menu.icon, { size: "20" })}</div>
                    <h2
                      style={{
                        transitionDelay: `${i + 3}00ms`,
                      }}
                      className={`whitespace-pre duration-500 ${
                        !open && "opacity-0 translate-x-28 overflow-hidden"
                      }`}
                    >
                      {menu.name}
                    </h2>
                  </button>
                ) : (
                  <button
                    onClick={() => handleMenuClick(menu)}
                    key={i}
                    className={`group flex items-center text-sm gap-3.5 font-medium px-2 py-3 rounded-xl w-full text-left ${
                      isMenuActive
                        ? "bg-[#3A3A3A] text-white"
                        : "hover:bg-[#282828]"
                    }`}
                  >
                    <div>{React.createElement(menu.icon, { size: "20" })}</div>
                    <h2
                      style={{
                        transitionDelay: `${i + 3}00ms`,
                      }}
                      className={`whitespace-pre duration-500 ${
                        !open && "opacity-0 translate-x-28 overflow-hidden"
                      }`}
                    >
                      {menu.name}
                    </h2>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bagian bawah untuk menampilkan info user */}
          <div className="mt-auto pb-4">
            <div className={`${!open ? "hidden" : "block"} mt-6`}>
              <div className="flex items-center gap-3 px-2 py-3 bg-[#282828] rounded-xl">
                <div className="border border-gray-400 rounded-full p-2 flex-shrink-0">
                  <AiOutlineUser size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SidebarAdminPusat;
