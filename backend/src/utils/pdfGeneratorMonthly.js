import PDFDocument from 'pdfkit';

// Generate monthly report PDF
export const generateMonthlyReportPDF = (monthlyReport) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      
      // Header
      doc.fontSize(16).font('Helvetica-Bold')
         .text('REVITALISASI SATUAN PENDIDIKAN SMA TAHUN 2025', 50, 50, { align: 'center' });
      
      doc.fontSize(14).font('Helvetica')
         .text(`LAPORAN BULANAN - ${monthlyReport.month}/${monthlyReport.year}`, 50, 80, { align: 'center' });
      
      // School Info
      doc.fontSize(12)
         .text(`Nama Sekolah: ${monthlyReport.School.name}`, 50, 120)
         .text(`Kabupaten: ${monthlyReport.School.kabupaten}`, 50, 140)
         .text(`Nilai Banper: Rp. ${monthlyReport.School.nilaiBanper?.toLocaleString('id-ID') || 'N/A'}`, 50, 160)
         .text(`Progress: ${monthlyReport.progress}%`, 50, 180);
      
      // Status
      doc.text(`Status: ${monthlyReport.status}`, 50, 200);
      
      // Progress Bar
      const barWidth = 400;
      const barHeight = 20;
      const progressWidth = (monthlyReport.progress / 100) * barWidth;
      
      doc.rect(50, 230, barWidth, barHeight).stroke();
      doc.rect(50, 230, progressWidth, barHeight).fillAndStroke('#3B82F6', '#3B82F6');
      
      // Notes and Recommendations
      if (monthlyReport.notes) {
        doc.text('Catatan:', 50, 270)
           .font('Helvetica')
           .text(monthlyReport.notes, 50, 290, { width: 500 });
      }
      
      if (monthlyReport.recommendations) {
        doc.text('Rekomendasi:', 50, 330)
           .font('Helvetica')
           .text(monthlyReport.recommendations, 50, 350, { width: 500 });
      }
      
      // Footer
      doc.fontSize(10)
         .text(`Dibuat pada: ${new Date().toLocaleDateString('id-ID')}`, 50, 700)
         .text(`Dibuat oleh: ${monthlyReport.generator?.name || 'System'}`, 50, 720);
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};