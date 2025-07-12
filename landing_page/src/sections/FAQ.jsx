import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQ = () => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqData = [
    {
      question: "Bagaimana kriteria sekolah penerima program revitalisasi?",
      answer: "Sekolah dipilih berdasarkan kondisi infrastruktur yang membutuhkan perbaikan, jumlah siswa, dan lokasi strategis untuk pemerataan pendidikan."
    },
    {
      question: "Berapa lama waktu pelaksanaan program per sekolah?",
      answer: "Setiap sekolah memiliki timeline 6 bulan dari Juli hingga Desember 2025 dengan milestone yang telah ditetapkan."
    },
    {
      question: "Bagaimana cara memantau progress pembangunan?",
      answer: "Progress dapat dipantau real-time melalui dashboard website ini yang diperbarui setiap hari oleh fasilitator lapangan."
    },
    {
      question: "Siapa yang bertanggung jawab atas pelaksanaan di lapangan?",
      answer: "Setiap sekolah memiliki fasilitator khusus yang bertanggung jawab memantau dan melaporkan progress pembangunan."
    },
    {
      question: "Dokumen apa saja yang tersedia untuk publik?",
      answer: "Tersedia Juknis DAK Fisik, RPJMN 2020-2024, kontrak kerja, dan dokumen regulasi lainnya yang dapat diunduh."
    }
  ];

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="container mx-auto md:w-10/11 w-11/12">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <p className="text-xl text-gray-600">
            Pertanyaan yang sering diajukan mengenai program revitalisasi
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg">
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{item.question}</span>
                  {expandedFAQ === index ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;