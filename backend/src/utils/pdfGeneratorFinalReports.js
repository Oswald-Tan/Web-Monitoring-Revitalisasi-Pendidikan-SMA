import PDFDocument from 'pdfkit';

export const generateFinalReportsPDF = (reports) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(16).font('Helvetica-Bold')
         .text('REKAPITULASI LAPORAN AKHIR REVITALISASI', 50, 50, { align: 'center' });
      doc.fontSize(12).font('Helvetica')
         .text(`Tanggal Generate: ${new Date().toLocaleDateString('id-ID')}`, 50, 80);
      
      // Line separator
      doc.moveTo(50, 100).lineTo(550, 100).stroke();

      let yPosition = 130;
      reports.forEach((report, index) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(12).font('Helvetica-Bold')
           .text(`${index + 1}. ${report.School.name}`, 50, yPosition);
        yPosition += 20;
        
        doc.fontSize(10).font('Helvetica')
           .text(`Lokasi: ${report.School.location}, ${report.School.kabupaten}`, 70, yPosition);
        yPosition += 15;
        
        doc.text(`Periode: ${new Date(report.periodStart).toLocaleDateString('id-ID')} - ${new Date(report.periodEnd).toLocaleDateString('id-ID')}`, 70, yPosition);
        yPosition += 15;
        
        doc.text(`Progress: ${report.data.physicalProgress.overall.toFixed(2)}%`, 70, yPosition);
        yPosition += 15;
        
        doc.text(`Utilisasi Anggaran: ${report.data.financialSummary.utilizationPercentage.toFixed(2)}%`, 70, yPosition);
        yPosition += 20;
        
        // Line separator between reports
        doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
        yPosition += 20;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};