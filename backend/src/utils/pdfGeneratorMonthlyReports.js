import PDFDocument from "pdfkit";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { id } from "date-fns/locale";

export const generateMonthlyReportsPDF = (reports, month, year) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 20,
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

      // Pastikan hanya satu laporan per sekolah
      const uniqueReports = [];
      const schoolIds = new Set();
      
      reports.forEach((report) => {
        if (!schoolIds.has(report.schoolId)) {
          schoolIds.add(report.schoolId);
          uniqueReports.push(report);
        }
      });

      // Set default font
      doc.font("Helvetica").fontSize(8);

      // Header
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("MONTHLY REPORT", 50, 30, { align: "center" });

      doc
        .fontSize(12)
        .font("Helvetica")
        .text(
          `PROGRAM REVITALISASI BANGUNAN SATUAN PENDIDIKAN SMA - TAHUN ${year}`,
          50,
          50,
          { align: "center" }
        );

      // Info periode
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(new Date(year, month - 1));
      doc.fontSize(10).text(
        `Periode: ${format(startDate, "dd MMMM yyyy", {
          locale: id,
        })} - ${format(endDate, "dd MMMM yyyy", { locale: id })}`,
        50,
        70,
        { align: "center" }
      );

      // Table setup
      const tableTop = 90;
      const minRowHeight = 15;

      // Lebar kolom yang disesuaikan untuk memenuhi halaman
      const pageWidth = 842; // Lebar halaman A4 landscape dalam points
      const margin = 20;
      const availableWidth = pageWidth - 2 * margin;

      const colWidths = [
        30, // NO
        170, // NAMA SEKOLAH DAN PIC/P2SP
        160, // DATA DASAR BANPER GROUND BREAKING
        40, // REA
        40, // REN
        100, // GRAFIS
        availableWidth - (30 + 170 + 160 + 40 + 40 + 100), // PENCAPAIAN TAHAPAN PEKERJAAN DAN LANGKAH TINDAK LANJUT
      ];

      // Hitung tinggi baris untuk setiap report
      const rowHeights = uniqueReports.map((report) => {
        let maxCellHeight = minRowHeight;

        // Hitung tinggi untuk sel NAMA SEKOLAH DAN PIC/P2SP
        const schoolInfo = `${report.School.name}\n${report.School.kabupaten}`;
        const schoolInfoHeight = doc.heightOfString(schoolInfo, {
          width: colWidths[1] - 10,
          lineGap: 2,
        });

        let facilitatorHeight = 0;
        if (
          report.data &&
          report.data.school &&
          report.data.school.facilitator
        ) {
          const facilitatorInfo = `${report.data.school.facilitator.name} (KS): ${report.data.school.facilitator.phone}`;
          doc.fontSize(6);
          facilitatorHeight = doc.heightOfString(facilitatorInfo, {
            width: colWidths[1] - 10,
            lineGap: 2,
          });
          doc.fontSize(8);
        }

        const cell1Height = schoolInfoHeight + facilitatorHeight + 6;
        maxCellHeight = Math.max(maxCellHeight, cell1Height);

        // Hitung tinggi untuk sel DATA DASAR BANPER
        const banperInfo = formatBanperInfo(
          report.School.nilaiBanper,
          report.School.durasi,
          report.School.startDate,
          report.School.finishDate
        );
        const cell2Height =
          doc.heightOfString(banperInfo, {
            width: colWidths[2] - 10,
            lineGap: 2,
          }) + 6;
        maxCellHeight = Math.max(maxCellHeight, cell2Height);

        // Hitung tinggi untuk sel PENCAPAIAN (kolom terakhir)
        let achievementHeight = minRowHeight;
        const weeklyReviews = report.data?.weeklyReviews || [];
        
        if (weeklyReviews.length > 0) {
          achievementHeight = 5; // Top padding
          
          weeklyReviews.forEach((review) => {
            // Tinggi untuk label minggu
            achievementHeight += 10;
            
            // Tinggi untuk notes jika ada
            if (review.notes) {
              achievementHeight += doc.heightOfString(review.notes, {
                width: colWidths[6] - 15,
                lineGap: 2,
              });
            }
            
            // Tinggi untuk recommendations jika ada
            if (review.recommendations) {
              achievementHeight += doc.heightOfString(review.recommendations, {
                width: colWidths[6] - 15,
                lineGap: 2,
              });
            }
            
            // Tambahkan spacing antar minggu
            achievementHeight += 5;
          });
        } else {
          // Fallback ke data lama
          const achievementText = [
            `Prestasi Pekerjaan: ${report.notes || "Belum ada data pencapaian"}`,
            `Tindak Lanjut: ${
              report.recommendations || "Belum ada rekomendasi tindak lanjut"
            }`,
          ].join("\n");
          
          achievementHeight = doc.heightOfString(achievementText, {
            width: colWidths[6] - 10,
            lineGap: 3,
          }) + 10;
        }
        
        maxCellHeight = Math.max(maxCellHeight, achievementHeight);

        return maxCellHeight;
      });

      // Draw complex table headers
      doc.font("Helvetica-Bold").fontSize(8);
      let x = margin;
      let y = tableTop;

      // Baris 1 - Header utama
      // NO (rowspan 2)
      doc.rect(x, y, colWidths[0], minRowHeight * 2).stroke();
      doc.text("No", x + 5, y + minRowHeight - 5, {
        width: colWidths[0] - 10,
        align: "center",
      });
      x += colWidths[0];

      // NAMA SEKOLAH DAN PIC/P2SP (rowspan 2)
      doc.rect(x, y, colWidths[1], minRowHeight * 2).stroke();
      doc.text("Nama Sekolah dan PIC/P2SP", x + 5, y + minRowHeight - 5, {
        width: colWidths[1] - 10,
        align: "center",
      });
      x += colWidths[1];

      // DATA DASAR BANPER (rowspan 2)
      doc.rect(x, y, colWidths[2], minRowHeight * 2).stroke();
      doc.text("Data Dasar BanPer", x + 5, y + minRowHeight - 5, {
        width: colWidths[2] - 10,
        align: "center",
      });
      x += colWidths[2];

      // PRESTASI PEKERJAAN SD MINGGU INI (colspan 3)
      const prestasiWidth = colWidths[3] + colWidths[4] + colWidths[5];
      doc.rect(x, y, prestasiWidth, minRowHeight).stroke();
      doc.text("Prestasi Pekerjaan s/d Minggu Ini (%)", x + 5, y + 3, {
        width: prestasiWidth - 10,
        align: "center",
      });

      // PENCAPAIAN TAHAPAN PEKERJAAN DAN LANGKAH TINDAK LANJUT (rowspan 2)
      const pencapaianX = x + prestasiWidth;
      doc.rect(pencapaianX, y, colWidths[6], minRowHeight * 2).stroke();
      doc.text(
        "Pencapaian Tahapan Pekerjaan dan Langkah Tindak Lanjut",
        pencapaianX + 5,
        y + minRowHeight - 5,
        {
          width: colWidths[6] - 10,
          align: "center",
        }
      );

      // Baris 2 - Sub header untuk PRESTASI PEKERJAAN
      y += minRowHeight;
      x = margin + colWidths[0] + colWidths[1] + colWidths[2];

      // REA
      doc.rect(x, y, colWidths[3], minRowHeight).stroke();
      doc.text("Rea", x + 5, y + 3, {
        width: colWidths[3] - 10,
        align: "center",
      });
      x += colWidths[3];

      // REN
      doc.rect(x, y, colWidths[4], minRowHeight).stroke();
      doc.text("Ren", x + 5, y + 3, {
        width: colWidths[4] - 10,
        align: "center",
      });
      x += colWidths[4];

      // GRAFIS
      doc.rect(x, y, colWidths[5], minRowHeight).stroke();
      doc.text("Grafis", x + 5, y + 3, {
        width: colWidths[5] - 10,
        align: "center",
      });

      // Draw table rows
      doc.font("Helvetica").fontSize(8);
      y += minRowHeight;

      uniqueReports.forEach((report, index) => {
        const rowHeight = rowHeights[index];

        // Check if need new page - pastikan ada cukup ruang untuk baris ini
        if (y + rowHeight > doc.page.height - 50) {
          doc.addPage();
          y = 50; // Reset Y position for new page
        }

        x = margin;

        // NO
        doc.rect(x, y, colWidths[0], rowHeight).stroke();
        doc.text((index + 1).toString(), x + 5, y + (rowHeight / 2 - 3), {
          width: colWidths[0] - 10,
          align: "center",
        });
        x += colWidths[0];

        // NAMA SEKOLAH DAN PIC/P2SP
        doc.rect(x, y, colWidths[1], rowHeight).stroke();
        let textY = y + 3;

        doc.font("Helvetica-Bold");
        doc.text(report.School.name, x + 5, textY, {
          width: colWidths[1] - 10,
          align: "left",
        });

        const nameHeight = doc.heightOfString(report.School.name, {
          width: colWidths[1] - 10,
          lineGap: 2,
        });
        textY += nameHeight;

        doc.font("Helvetica");
        doc.text(report.School.kabupaten, x + 5, textY, {
          width: colWidths[1] - 10,
          align: "left",
          lineGap: 2,
        });

        const districtHeight = doc.heightOfString(report.School.kabupaten, {
          width: colWidths[1] - 10,
          lineGap: 2,
        });
        textY += districtHeight + 2;

        if (
          report.data &&
          report.data.school &&
          report.data.school.facilitator
        ) {
          const facilitatorInfo = `${report.data.school.facilitator.name} (KS): ${report.data.school.facilitator.phone}`;
          doc.fontSize(6).text(facilitatorInfo, x + 5, textY, {
            width: colWidths[1] - 10,
            align: "left",
          });
          doc.fontSize(8);
        }

        x += colWidths[1];

        // DATA DASAR BANPER GROUND BREAKING
        doc.rect(x, y, colWidths[2], rowHeight).stroke();
        const banperX = x + 5;
        let banperY = y + 3;

        const banperLines = [
          {
            label: "Nilai BanPer: ",
            value: formatCurrency(report.School.nilaiBanper),
          },
          { label: "Durasi: ", value: `${report.School.durasi} Hari` },
          { label: "Start: ", value: formatDate(report.School.startDate) },
          { label: "Finish: ", value: formatDate(report.School.finishDate) },
        ];

        banperLines.forEach((line) => {
          doc
            .font("Helvetica-Bold")
            .text(line.label, banperX, banperY, {
              width: colWidths[2] - 10,
              continued: true,
            })
            .font("Helvetica")
            .text(line.value);
          banperY += 10;
        });

        x += colWidths[2];

        // REA
        doc.rect(x, y, colWidths[3], rowHeight).stroke();
        doc.text(
          `${report.progress.toFixed(2)}`,
          x + 5,
          y + (rowHeight / 2 - 3),
          {
            width: colWidths[3] - 10,
            align: "center",
          }
        );
        x += colWidths[3];

        // REN
        doc.rect(x, y, colWidths[4], rowHeight).stroke();
        doc.text(
          `${report.plannedProgress.toFixed(2)}`,
          x + 5,
          y + (rowHeight / 2 - 3),
          {
            width: colWidths[4] - 10,
            align: "center",
          }
        );
        x += colWidths[4];

        // GRAFIS
        doc.rect(x, y, colWidths[5], rowHeight).stroke();

        const graphWidth = colWidths[5] - 15;
        const barHeight = 6;

        // Progress bar REA
        const reaY = y + 5;
        const reaProgress = Math.min(report.progress, 100);

        doc
          .fillColor("#f0f0f0")
          .strokeColor("#cccccc")
          .rect(x + 10, reaY, graphWidth, barHeight)
          .fillAndStroke();

        if (reaProgress > 0) {
          doc
            .fillColor("#3b82f6")
            .strokeColor("#3b82f6")
            .rect(x + 10, reaY, (graphWidth * reaProgress) / 100, barHeight)
            .fillAndStroke();
        }

        doc
          .fillColor("black")
          .fontSize(6)
          .text(
            `REA: ${reaProgress.toFixed(2)}%`,
            x + 10,
            reaY + barHeight + 2,
            {
              width: graphWidth,
              align: "center",
            }
          );

        // Progress bar REN
        const renY = reaY + barHeight + 10;
        const renProgress = Math.min(report.plannedProgress, 100);

        doc
          .fillColor("#f0f0f0")
          .strokeColor("#cccccc")
          .rect(x + 10, renY, graphWidth, barHeight)
          .fillAndStroke();

        if (renProgress > 0) {
          doc
            .fillColor("#f97316")
            .strokeColor("#f97316")
            .rect(x + 10, renY, (graphWidth * renProgress) / 100, barHeight)
            .fillAndStroke();
        }

        doc
          .fillColor("black")
          .fontSize(6)
          .text(
            `REN: ${renProgress.toFixed(2)}%`,
            x + 10,
            renY + barHeight + 2,
            {
              width: graphWidth,
              align: "center",
            }
          );

        // Status dan variance
        const status = getStatusFromVariance(report.variance);
        const statusColor = getStatusColor(report.variance);
        const statusY = renY + barHeight + 10;

        doc
          .fillColor(statusColor)
          .strokeColor(statusColor)
          .rect(x + 10, statusY, graphWidth, 10)
          .fillAndStroke();

        doc
          .fillColor("white")
          .fontSize(6)
          .text(status, x + 10, statusY + 1, {
            width: graphWidth,
            align: "center",
          });

        doc
          .fillColor("black")
          .fontSize(7)
          .text(
            `${report.variance >= 0 ? "+" : ""}${report.variance.toFixed(2)}`,
            x + 10,
            statusY + 11,
            { width: graphWidth, align: "center" }
          );

        doc.strokeColor("black").fillColor("black");
        x += colWidths[5];

        // PENCAPAIAN TAHAPAN PEKERJAAN DAN LANGKAH TINDAK LANJUT - PERBAIKAN BESAR
        doc.rect(x, y, colWidths[6], rowHeight).stroke();

        const weeklyReviews = report.data?.weeklyReviews || [];
        let contentY = y + 5;

        if (weeklyReviews.length > 0) {
          weeklyReviews.forEach((review, idx) => {
            // Label minggu
            doc
              .font("Helvetica-Bold")
              .fontSize(8)
              .text(`Minggu ${review.weekNumber}:`, x + 5, contentY);

            contentY += 10;

            // Notes
            if (review.notes) {
              const notesHeight = doc.heightOfString(review.notes, {
                width: colWidths[6] - 15,
                lineGap: 2,
              });
              
              doc
                .font("Helvetica")
                .fontSize(7)
                .text(`Pencapaian: ${review.notes}`, x + 5, contentY, {
                  width: colWidths[6] - 15,
                  align: "left",
                });
                
              contentY += notesHeight + 3;
            }

            // Recommendations
            if (review.recommendations) {
              const recommendationsHeight = doc.heightOfString(review.recommendations, {
                width: colWidths[6] - 15,
                lineGap: 2,
              });
              
              doc
                .font("Helvetica")
                .fontSize(7)
                .text(`Tindak Lanjut: ${review.recommendations}`, x + 5, contentY, {
                  width: colWidths[6] - 15,
                  align: "left",
                });
                
              contentY += recommendationsHeight + 5;
            }

            // Garis pemisah antar minggu (kecuali minggu terakhir)
            if (idx < weeklyReviews.length - 1) {
              doc
                .moveTo(x + 5, contentY)
                .lineTo(x + colWidths[6] - 5, contentY)
                .stroke();
              contentY += 5;
            }
          });
        } else {
          // Fallback ke data lama
          const achievementText = [
            `Prestasi Pekerjaan: ${report.notes || "Belum ada data pencapaian"}`,
            `Tindak Lanjut: ${
              report.recommendations || "Belum ada rekomendasi tindak lanjut"
            }`,
          ].join("\n");

          const textHeight = doc.heightOfString(achievementText, {
            width: colWidths[6] - 10,
            lineGap: 3,
          });

          doc.text(achievementText, x + 5, y + (rowHeight - textHeight) / 2, {
            width: colWidths[6] - 10,
            align: "left",
            lineGap: 3,
          });
        }

        y += rowHeight;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions
function formatCurrency(amount) {
  if (!amount) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBanperInfo(nilai, durasi, start, finish) {
  return [
    `Nilai BanPer: ${formatCurrency(nilai)}`,
    `Durasi: ${durasi} Hari`,
    `Start: ${formatDate(start)}`,
    `Finish: ${formatDate(finish)}`,
  ].join("\n");
}

function getStatusFromVariance(variance) {
  if (variance >= 5) return "LEBIH CEPAT";
  if (variance <= -10) return "TERLAMBAT";
  return "ON-TRACK";
}

function getStatusColor(variance) {
  if (variance >= 5) return "#22c55e"; // green
  if (variance <= -10) return "#ef4444"; // red
  return "#3b82f6"; // blue
}