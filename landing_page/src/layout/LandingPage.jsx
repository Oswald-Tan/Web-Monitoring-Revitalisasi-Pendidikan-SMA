import { useState } from "react";
import Header from "../sections/Header";
import Hero from "../sections/Hero";
import Program from "../sections/Program";
import Sekolah from "../sections/Sekolah";
import Progress from "../sections/Progress";
import Dokumen from "../sections/Dokumen";
import Tim from "../sections/Tim";
import FAQ from "../sections/FAQ";
import Kontak from "../sections/Kontak";

const LandingPage = () => {
  const [activeSection, setActiveSection] = useState("beranda");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen">
      <Header 
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
      />

      <Hero />
      <Program />
      <Sekolah />
      <Progress />
      {/* <Dokumen /> */}
      <Tim />
      <FAQ />
      <Kontak />
    </div>
  );
};

export default LandingPage;
