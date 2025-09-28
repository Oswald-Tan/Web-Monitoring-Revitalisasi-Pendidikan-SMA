import PDFDocument from "pdfkit";

export const generateWeeklyReportPDF = (weeklyReview) => {
  return new Promise((resolve, reject) => {
    try {
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

      // Variabel untuk melacak halaman
      let isFirstPage = true;

      // Fungsi untuk menggambar header tabel
      const drawTableHeader = (doc, y, scaledColWidths) => {
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const leftMargin = doc.page.margins.left;
        
        doc.font("Helvetica-Bold").fontSize(8);
        
        // Baris 1 - Header utama
        let x = leftMargin;

        // No (rowspan 3)
        doc.rect(x, y, scaledColWidths[0], 60).stroke();
        doc.text("No", x + 5, y + 25, {
          width: scaledColWidths[0] - 10,
          align: "center",
        });
        x += scaledColWidths[0];

        // Uraian Pekerjaan (rowspan 3)
        doc.rect(x, y, scaledColWidths[1], 60).stroke();
        doc.text("Uraian Pekerjaan", x + 5, y + 25, {
          width: scaledColWidths[1] - 10,
          align: "center",
        });
        x += scaledColWidths[1];

        // Volume (rowspan 3)
        doc.rect(x, y, scaledColWidths[2], 60).stroke();
        doc.text("Volume", x + 5, y + 25, {
          width: scaledColWidths[2] - 10,
          align: "center",
        });
        x += scaledColWidths[2];

        // Sat (rowspan 3)
        doc.rect(x, y, scaledColWidths[3], 60).stroke();
        doc.text("Sat", x + 5, y + 25, {
          width: scaledColWidths[3] - 10,
          align: "center",
        });
        x += scaledColWidths[3];

        // Bobot (%) (rowspan 3)
        doc.rect(x, y, scaledColWidths[4], 60).stroke();
        doc.text("Bobot (%)", x + 5, y + 25, {
          width: scaledColWidths[4] - 10,
          align: "center",
        });
        x += scaledColWidths[4];

        // Prestasi Pekerjaan (colspan 6)
        const prestasiWidth = scaledColWidths.slice(5, 11).reduce((sum, width) => sum + width, 0);
        doc.rect(x, y, prestasiWidth, 20).stroke();
        doc.text("Prestasi Pekerjaan", x + 5, y + 5, {
          width: prestasiWidth - 10,
          align: "center",
        });

        // Bobot Masing2 (rowspan 3)
        const bobotX = x + prestasiWidth;
        doc.rect(bobotX, y, scaledColWidths[11], 60).stroke();
        doc.text("Bobot Masing2\nPekerjaan (%)", bobotX + 5, y + 15, {
          width: scaledColWidths[11] - 10,
          align: "center",
          lineGap: 2,
        });

        // Keterangan (rowspan 3)
        const keteranganX = bobotX + scaledColWidths[11];
        doc.rect(keteranganX, y, scaledColWidths[12], 60).stroke();
        doc.text("Keterangan", keteranganX + 5, y + 25, {
          width: scaledColWidths[12] - 10,
          align: "center",
        });

        // Baris 2 - Sub header
        y += 20;
        x = leftMargin + scaledColWidths.slice(0, 5).reduce((sum, width) => sum + width, 0);

        // s/d Minggu Lalu (colspan 2)
        const sdMingguLaluWidth = scaledColWidths[5] + scaledColWidths[6];
        doc.rect(x, y, sdMingguLaluWidth, 20).stroke();
        doc.text("s/d Minggu Lalu", x + 5, y + 5, {
          width: sdMingguLaluWidth - 10,
          align: "center",
        });
        x += sdMingguLaluWidth;

        // Dalam Minggu Ini (colspan 2)
        const dalamMingguIniWidth = scaledColWidths[7] + scaledColWidths[8];
        doc.rect(x, y, dalamMingguIniWidth, 20).stroke();
        doc.text("Dalam Minggu Ini", x + 5, y + 5, {
          width: dalamMingguIniWidth - 10,
          align: "center",
        });
        x += dalamMingguIniWidth;

        // s/d Minggu Ini (colspan 2)
        const sdMingguIniWidth = scaledColWidths[9] + scaledColWidths[10];
        doc.rect(x, y, sdMingguIniWidth, 20).stroke();
        doc.text("s/d Minggu Ini", x + 5, y + 5, {
          width: sdMingguIniWidth - 10,
          align: "center",
        });

        // Baris 3 - Sub sub header
        y += 20;
        x = leftMargin + scaledColWidths.slice(0, 5).reduce((sum, width) => sum + width, 0);

        // 6 kolom untuk detail prestasi
        const subHeaders = ["Volume", "Bobot (%)", "Volume", "Bobot (%)", "Volume", "Bobot (%)"];
        for (let i = 0; i < 6; i++) {
          doc.rect(x, y, scaledColWidths[5 + i], 20).stroke();
          doc.text(subHeaders[i], x + 5, y + 5, {
            width: scaledColWidths[5 + i] - 10,
            align: "center",
          });
          x += scaledColWidths[5 + i];
        }

        return y + 20;
      };

      // Fungsi untuk menggambar tabel
      const drawTable = (doc, tableData, startY) => {
        let y = startY;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const leftMargin = doc.page.margins.left;

        const formatNumber = (num) => {
          if (num === null || num === undefined || num === "") return "";
          const number = Number(num);
          if (isNaN(number)) return "";
          const rounded = Math.round(number * 10000) / 10000;
          return rounded.toString().replace(/(\.0+$)|(0+$)/, "");
        };

        // Define column widths
        const colWidths = [
          30, 120, 40, 25, 40, 40, 40, 40, 40, 40, 40, 50, 60
        ];

        const totalWidth = colWidths.reduce((sum, width) => sum + width, 0);
        const scaleFactor = pageWidth / totalWidth;
        const scaledColWidths = colWidths.map((width) => width * scaleFactor);

        // Gambar header tabel hanya di halaman pertama
        if (isFirstPage) {
          y = drawTableHeader(doc, y, scaledColWidths);
          isFirstPage = false;
        }

        doc.font("Helvetica").fontSize(8);

        tableData.forEach((category, categoryIndex) => {
          // Check if we need a new page before drawing category
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = doc.page.margins.top;
          }

          // Category row
          const romanNumeral = convertToRoman(categoryIndex + 1);

          doc.rect(leftMargin, y, scaledColWidths[0], 15).stroke();
          doc.text(romanNumeral, leftMargin + 5, y + 4, {
            width: scaledColWidths[0] - 10,
            align: "center",
          });

          const uraianWidth = scaledColWidths.slice(1).reduce((sum, width) => sum + width, 0);
          doc.rect(leftMargin + scaledColWidths[0], y, uraianWidth, 15).stroke();
          doc.text(category.title, leftMargin + scaledColWidths[0] + 5, y + 4, {
            width: uraianWidth - 10,
            align: "left",
          });

          y += 15;

          // Items
          category.items.forEach((item, itemIndex) => {
            // Check if we need a new page before drawing item
            if (y > doc.page.height - 100) {
              doc.addPage();
              y = doc.page.margins.top;
            }

            let x = leftMargin;
            const rowData = [
              item.no.toString(),
              item.uraian,
              formatNumber(item.volume),
              item.sat,
              formatNumber(item.bobot),
              formatNumber(item.sdMingguLaluVolume),
              formatNumber(item.sdMingguLaluBobot),
              formatNumber(item.dalamMingguIniVolume),
              formatNumber(item.dalamMingguIniBobot),
              formatNumber(item.sdMingguIniVolume),
              formatNumber(item.sdMingguIniBobot),
              formatNumber(item.bobotMasing),
              item.keterangan || "",
            ];

            rowData.forEach((text, i) => {
              doc.rect(x, y, scaledColWidths[i], 15).stroke();

              let align = "right";
              if (i === 0) align = "center";
              if (i === 1) align = "left";
              if (i === 3) align = "center";
              if (i === 12) align = "left";

              doc.text(text, x + 5, y + 4, {
                width: scaledColWidths[i] - 10,
                align: align,
              });

              x += scaledColWidths[i];
            });

            y += 15;
          });
        });

        // Footer Table
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        let x = leftMargin;
        doc.rect(x, y, scaledColWidths[0] + scaledColWidths[1], 15).stroke();
        doc.text("JUMLAH", x + 5, y + 4, {
          width: scaledColWidths[0] + scaledColWidths[1] - 10,
          align: "left",
          fontWeight: "bold",
        });

        x += scaledColWidths[0] + scaledColWidths[1];

        // Volume
        doc.rect(x, y, scaledColWidths[2], 15).stroke();
        doc.text(formatNumber(weeklyReview.data.totals.volume), x + 5, y + 4, {
          width: scaledColWidths[2] - 10,
          align: "right",
          fontWeight: "bold",
        });
        x += scaledColWidths[2];

        // Sat
        doc.rect(x, y, scaledColWidths[3], 15).stroke();
        doc.text("-", x + 5, y + 4, {
          width: scaledColWidths[3] - 10,
          align: "center",
          fontWeight: "bold",
        });
        x += scaledColWidths[3];

        // Bobot
        doc.rect(x, y, scaledColWidths[4], 15).stroke();
        doc.text(formatNumber(weeklyReview.data.totals.bobot), x + 5, y + 4, {
          width: scaledColWidths[4] - 10,
          align: "right",
          fontWeight: "bold",
        });
        x += scaledColWidths[4];

        // Prestasi Pekerjaan
        const prestasiValues = [
          formatNumber(weeklyReview.data.totals.sdMingguLaluVolume),
          formatNumber(weeklyReview.data.totals.sdMingguLaluBobot),
          formatNumber(weeklyReview.data.totals.dalamMingguIniVolume),
          formatNumber(weeklyReview.data.totals.dalamMingguIniBobot),
          formatNumber(weeklyReview.data.totals.sdMingguIniVolume),
          formatNumber(weeklyReview.data.totals.sdMingguIniBobot),
        ];

        for (let i = 0; i < 6; i++) {
          doc.rect(x, y, scaledColWidths[5 + i], 15).stroke();
          doc.text(prestasiValues[i], x + 5, y + 4, {
            width: scaledColWidths[5 + i] - 10,
            align: "right",
            fontWeight: "bold",
          });
          x += scaledColWidths[5 + i];
        }

        // Bobot Masing
        doc.rect(x, y, scaledColWidths[11], 15).stroke();
        doc.text(formatNumber(weeklyReview.data.totals.bobotMasing), x + 5, y + 4, {
          width: scaledColWidths[11] - 10,
          align: "right",
          fontWeight: "bold",
        });
        x += scaledColWidths[11];

        // Keterangan
        doc.rect(x, y, scaledColWidths[12], 15).stroke();
        doc.text("-", x + 5, y + 4, {
          width: scaledColWidths[12] - 10,
          align: "center",
          fontWeight: "bold",
        });

        return y + 20;
      };

      // Header
      doc.fontSize(14).font("Helvetica-Bold")
        .text("LAPORAN MINGGUAN REVITALISASI SMA", 50, 40, { align: "center" });

      // Info Sekolah
      doc.fontSize(10).font("Helvetica")
        .text(`Sekolah: ${weeklyReview.school.name}`, 50, 85)
        .text(`Kabupaten: ${weeklyReview.school.kabupaten}`, 50, 100);

      // Periode
      doc.text(
        `Periode: ${new Date(weeklyReview.startDate).toLocaleDateString("id-ID")} - ${new Date(weeklyReview.endDate).toLocaleDateString("id-ID")}`,
        400,
        85
      );

      // Progress Summary
      doc.text(
        `Minggu Ke: ${weeklyReview.data.headerInfo.weekNumber} Tahun: ${weeklyReview.data.headerInfo.year}`,
        400,
        100
      );

      // Draw table
      const finalY = drawTable(doc, weeklyReview.data.tableData, 140);

      // Tanda tangan
      let signatureY = finalY + 40;
      if (signatureY > doc.page.height - 100) {
        doc.addPage();
        signatureY = doc.page.margins.top;
      }

      const signatureWidth = (doc.page.width - 100) / 3;
      const signatureStyles = { fontSize: 10, lineGap: 5 };

      // Tanda Tangan Kiri
      doc.font("Helvetica").fontSize(signatureStyles.fontSize)
        .text("Mengetahui", 50, signatureY, {
          width: signatureWidth,
          align: "center",
          lineGap: signatureStyles.lineGap,
        })
        .text("Kepala SMA Negeri 1 Karangreja", 50, signatureY + 15, {
          width: signatureWidth,
          align: "center",
          lineGap: signatureStyles.lineGap,
        })
        .text("Dra. Esti Nurhayati, M.Pd", 50, signatureY + 70, {
          width: signatureWidth,
          align: "center",
          lineGap: signatureStyles.lineGap,
        })
        .text("NIP: 19651008 199402 2 005", 50, signatureY + 85, {
          width: signatureWidth,
          align: "center",
          lineGap: signatureStyles.lineGap,
        });

      // Tanda Tangan Tengah
      doc.text("Mengetahui", 50 + signatureWidth, signatureY, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      })
      .text("Ketua Komite", 50 + signatureWidth, signatureY + 15, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      })
      .text("Asep Winardi Hermawan, S.Kom", 50 + signatureWidth, signatureY + 70, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      })
      .text("NIP: 19760727 200903 1 005", 50 + signatureWidth, signatureY + 85, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      });

      // Tanda Tangan Kanan
      doc.text("Pengawas", 50 + signatureWidth * 2, signatureY, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      })
      .text("Sutiyanto, S.T.", 50 + signatureWidth * 2, signatureY + 70, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      })
      .text("NIP: -", 50 + signatureWidth * 2, signatureY + 85, {
        width: signatureWidth,
        align: "center",
        lineGap: signatureStyles.lineGap,
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Fungsi convertToRoman
function convertToRoman(num) {
  const romanNumerals = [
    { value: 1000, symbol: "M" },
    { value: 900, symbol: "CM" },
    { value: 500, symbol: "D" },
    { value: 400, symbol: "CD" },
    { value: 100, symbol: "C" },
    { value: 90, symbol: "XC" },
    { value: 50, symbol: "L" },
    { value: 40, symbol: "XL" },
    { value: 10, symbol: "X" },
    { value: 9, symbol: "IX" },
    { value: 5, symbol: "V" },
    { value: 4, symbol: "IV" },
    { value: 1, symbol: "I" },
  ];

  let result = "";
  for (const { value, symbol } of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}