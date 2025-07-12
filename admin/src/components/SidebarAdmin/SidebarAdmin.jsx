import React, { useEffect, useState } from "react";
import {
  RiFileCopy2Line,
} from "react-icons/ri";
import { TbLayoutDashboard } from "react-icons/tb";
import { AiOutlineUser } from "react-icons/ai";
import { LuMonitor, LuList, LuSchool, LuSunMedium, LuMoon, LuSettings  } from "react-icons/lu";
import { BiGroup } from "react-icons/bi";
import { MdKeyboardArrowUp, MdKeyboardArrowDown } from "react-icons/md";
import { FiLogOut } from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi";
import { useSidebar } from "../../context/useSidebar";
import { Link, useNavigate } from "react-router-dom";
import { FaHouse } from "react-icons/fa6";
import useDarkMode from "../../hooks/useDarkMode";

const SidebarAdminJurusan = () => {
  const navigate = useNavigate();
  const { open, toggleSidebar } = useSidebar();
  const [menus, setMenus] = useState([]);
  const [activeSubMenu, setActiveSubMenu] = useState("");
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  // Data dummy user
  const user = {
    role: "admin_jurusan",
    username: "Admin Jurusan",
    email: "admin.jurusan@example.com",
  };

  // Tutup semua submenu saat sidebar ditutup
  useEffect(() => {
    if (!open) {
      setActiveSubMenu("");
    }
  }, [open]);

  useEffect(() => {
    // Menu untuk admin jurusan
    const updatedMenus = [
      {
        name: "Dashboard",
        link: "/dashboard",
        icon: TbLayoutDashboard,
      },
      {
        name: "Sekolah",
        icon: LuSchool,
        hasSubMenu: true,
        subMenu: [
          { name: "Daftar Sekolah", link: "/sekolah/daftar-sekolah" },
          { name: "Detail Sekolah", link: "/sekolah/detail-sekolah" },
        ],
      },
      {
        name: "Monitoring",
        icon: LuMonitor,
        hasSubMenu: true,
        subMenu: [
          { name: "Input Harian", link: "/monitoring/input-harian" },
          { name: "Reviu Mingguan", link: "/monitoring/reviu-mingguan" },
        ],
      },
      {
        name: "Pelaporan",
        icon: LuList,
        hasSubMenu: true,
        subMenu: [
          { name: "Laporan Bulanan", link: "/pelaporan/laporan-bulanan" },
          { name: "Laporan Akhir", link: "/pelaporan/laporan-akhir" },
        ],
      },
      {
        name: "Koordinasi",
        icon: HiOutlineDocumentText,
        hasSubMenu: true,
        subMenu: [
          { name: "Kalender Kegiatan", link: "/koordinasi/kalender-kegiatan" },
          { name: "Forum Diskusi", link: "/koordinasi/forum-diskusi" },
        ],
      },
      {
        name: "Dokumen",
        hasSubMenu: true,
        subMenu: [
          { name: "Template & SOP", link: "/dokumen/template-sop" },
          { name: "Arsip Regulasi", link: "/dokumen/arsip-regulasi" },
        ],
        icon: RiFileCopy2Line,
      },
      {
        name: "Manajemen Tim",
        hasSubMenu: true,
        subMenu: [
          { name: "Profile Personel", link: "/manajemen-tim/profil-personel" },
          { name: "Pembagian Tugas", link: "/manajemen-tim/pembagian-tugas" },
        ],
        icon: BiGroup,
      },
      {
        name: "Pengaturan Akun",
        hasSubMenu: true,
        subMenu: [
          { name: "Profil Akun", link: "/pengaturan/profil-akun" },
          { name: "Hak Akses", link: "/pengaturan/hak-akses" },
        ],
        icon: LuSettings ,
      },
      {
        name: isDarkMode ? "Light Mode" : "Dark Mode",
        icon: isDarkMode ? LuSunMedium : LuMoon ,
        action: toggleDarkMode,
      },
      {
        name: "Logout",
        action: () => logout(),
        icon: FiLogOut,
      },
    ];

    setMenus(updatedMenus);
  }, [isDarkMode]);

  // Fungsi logout sederhana tanpa backend
  const logout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      navigate("/");
    }
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
                Admin Portal
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
                if (menu.hasSubMenu) {
                  return (
                    <div key={i} className="">
                      <button
                        onClick={() => handleSubMenuClick(menu.name)}
                        className={`group flex items-center justify-between w-full text-sm gap-3.5 font-medium px-2 py-3 hover:bg-[#282828] rounded-xl text-left`}
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
                          {menu.subMenu.map((sub, j) => (
                            <Link
                              to={sub.link}
                              key={j}
                              className="flex items-center text-sm gap-3.5 font-medium px-2 py-2 hover:bg-[#282828] rounded-lg transition-colors duration-200"
                              onClick={() => !open && toggleSidebar()}
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
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return menu.action ? (
                  <button
                    key={i}
                    onClick={menu.action}
                    className={`group flex items-center text-sm gap-3.5 font-medium px-2 py-3 hover:bg-[#282828] rounded-xl w-full text-left`}
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
                  <Link
                    to={menu.link}
                    key={i}
                    className={`group flex items-center text-sm gap-3.5 font-medium px-2 py-3 hover:bg-[#282828] rounded-xl`}
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
                  </Link>
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
                  <p className="text-sm font-medium truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SidebarAdminJurusan;
