import PDFDocument from 'pdfkit';

export const generateFinalReportPDF = (finalReport) => {
  return new Promise((resolve, reject) => {
    try {
      // Pastikan data yang diterima valid
      if (!weeklyReview?.data) {
        reject(new Error("Invalid weekly review data structure"));
        return;
      }

      const doc = new PDFDocument({
        margin: 30,
        size: "A4",
        layout: "landscape",
        bufferPages: true,
      });

      const buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(16).font('Helvetica-Bold')
         .text('LAPORAN AKHIR REVITALISASI', 50, 50, { align: 'center' });
      doc.fontSize(12).font('Helvetica')
         .text(`SATUAN PENDIDIKAN: ${finalReport.School.name}`, 50, 80);
      doc.text(`LOKASI: ${finalReport.School.location}, ${finalReport.School.kabupaten}`, 50, 95);
      doc.text(`PERIODE: ${new Date(finalReport.periodStart).toLocaleDateString('id-ID')} - ${new Date(finalReport.periodEnd).toLocaleDateString('id-ID')}`, 50, 110);
      
      // Line separator
      doc.moveTo(50, 130).lineTo(550, 130).stroke();

      // Executive Summary
      doc.fontSize(14).font('Helvetica-Bold').text('RINGKASAN EKSEKUTIF', 50, 150);
      doc.fontSize(10).font('Helvetica')
         .text(finalReport.executiveSummary || finalReport.data.executiveSummary, 50, 170, {
           width: 500,
           align: 'justify'
         });

      // Progress Summary
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('RINGKASAN PROGRESS FISIK', 50, 50);
      
      // Overall progress
      doc.fontSize(12).font('Helvetica-Bold').text('Progress Keseluruhan:', 50, 80);
      doc.fontSize(12).font('Helvetica')
         .text(`${finalReport.data.physicalProgress.overall.toFixed(2)}%`, 200, 80);
      
      // Progress by category
      let yPosition = 110;
      doc.fontSize(12).font('Helvetica-Bold').text('Progress per Kategori:', 50, yPosition);
      yPosition += 20;
      
      Object.entries(finalReport.data.physicalProgress.byCategory).forEach(([category, data]) => {
        if (yPosition > 700) {
          doc.addPage();
          yPosition = 50;
        }
        
        doc.fontSize(10).font('Helvetica')
           .text(`${category}: ${data.percentage.toFixed(2)}%`, 70, yPosition);
        yPosition += 15;
      });

      // Financial Summary
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('RINGKASAN KEUANGAN', 50, 50);
      
      doc.fontSize(12).font('Helvetica-Bold').text('Anggaran Total:', 50, 80);
      doc.fontSize(12).font('Helvetica')
         .text(formatCurrency(finalReport.data.financialSummary.totalBudget), 200, 80);
      
      doc.fontSize(12).font('Helvetica-Bold').text('Realisasi Anggaran:', 50, 95);
      doc.fontSize(12).font('Helvetica')
         .text(formatCurrency(finalReport.data.financialSummary.realizedBudget), 200, 95);
      
      doc.fontSize(12).font('Helvetica-Bold').text('Persentase Utilisasi:', 50, 110);
      doc.fontSize(12).font('Helvetica')
         .text(`${finalReport.data.financialSummary.utilizationPercentage.toFixed(2)}%`, 200, 110);

      // Achievements and Challenges
      doc.addPage();
      doc.fontSize(14).font('Helvetica-Bold').text('PRESTASI DAN TANTANGAN', 50, 50);
      
      // Achievements
      doc.fontSize(12).font('Helvetica-Bold').text('Prestasi:', 50, 80);
      let achY = 100;
      finalReport.data.achievements.forEach((achievement, index) => {
        if (achY > 700) {
          doc.addPage();
          achY = 50;
        }
        
        doc.fontSize(10).font('Helvetica')
           .text(`${index + 1}. ${achievement.date} - ${achievement.item} (${achievement.progress}%)`, 70, achY);
        achY += 15;
      });
      
      // Challenges
      doc.fontSize(12).font('Helvetica-Bold').text('Tantangan:', 50, achY + 20);
      let chY = achY + 40;
      finalReport.data.challenges.forEach((challenge, index) => {
        if (chY > 700) {
          doc.addPage();
          chY = 50;
        }
        
        doc.fontSize(10).font('Helvetica')
           .text(`${index + 1}. Minggu ${challenge.week} - ${challenge.description}`, 70, chY, {
             width: 450
           });
        chY += 30;
      });

      // Recommendations
      if (finalReport.data.recommendations && finalReport.data.recommendations.length > 0) {
        doc.addPage();
        doc.fontSize(14).font('Helvetica-Bold').text('REKOMENDASI', 50, 50);
        
        let recY = 80;
        finalReport.data.recommendations.forEach((recommendation, index) => {
          if (recY > 700) {
            doc.addPage();
            recY = 50;
          }
          
          doc.fontSize(10).font('Helvetica')
             .text(`${index + 1}. ${recommendation}`, 70, recY, {
               width: 450
             });
          recY += 20;
        });
      }

      // Footer on each page
      let pageNumber = 1;
      doc.on('pageAdded', () => {
        pageNumber++;
        doc.fontSize(8).text(`Halaman ${pageNumber}`, 50, 800, { align: 'center' });
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

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