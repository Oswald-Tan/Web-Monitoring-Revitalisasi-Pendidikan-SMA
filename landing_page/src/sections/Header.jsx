import { School, Target, X, Menu } from "lucide-react";
import LogoPoli from "../assets/logo_poli.webp";
import LogoKemendikbud from "../assets/logo_kemendikbud.webp";

const Header = ({
  activeSection,
  mobileMenuOpen,
  setMobileMenuOpen,
  scrollToSection,
}) => {
  const menuItems = [
    { id: "beranda", label: "Beranda" },
    { id: "program", label: "Program" },
    { id: "sekolah", label: "Sekolah" },
    { id: "progress", label: "Progress" },
    { id: "dokumen", label: "Dokumen" },
    { id: "tim", label: "Tim" },
    { id: "faq", label: "FAQ" },
    { id: "kontak", label: "Kontak" },
  ];

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto py-4 md:w-10/11 w-11/12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center md:space-x-3 space-x-2">
              <div>
                <img
                  src={LogoKemendikbud}
                  alt="Logo Kemendikbud"
                  className="md:w-10 md:h-10 w-9 h-9"
                />
              </div>
              <div>
                <img
                  src={LogoPoli}
                  alt="Logo Politeknik Negeri Manado"
                  className="md:w-10 md:h-10 w-9 h-9"
                />
              </div>
            </div>
            <div>
              <h1 className="md:text-xl text-md font-bold text-gray-900">
                Program Revitalisasi
              </h1>
              <p className="md:text-sm text-xs text-gray-600">
                SMA Sulut 2025
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <nav className="hidden md:flex space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.id
                    ? "text-amber-600"
                    : "text-gray-700 hover:text-amber-600"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-t-gray-200">
            <nav className="flex flex-col space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left py-2 px-4 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-amber-50 text-amber-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
