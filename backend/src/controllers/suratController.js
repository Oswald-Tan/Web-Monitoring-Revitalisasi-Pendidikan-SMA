import Surat from "../models/surat.js";
import User from "../models/user.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import PDFDocument from "pdfkit";
import { Op, Sequelize } from "sequelize";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk generate nomor surat otomatis
const generateNomorSurat = async (jenis) => {
  const prefix = jenis === "masuk" ? "M" : "K";
  const today = new Date();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();

  // Cari surat terakhir di bulan ini
  const lastSurat = await Surat.findOne({
    where: {
      jenis_surat: jenis,
      [Op.and]: [
        Sequelize.where(
          Sequelize.fn("MONTH", Sequelize.col("tanggal_surat")),
          month
        ),
        Sequelize.where(
          Sequelize.fn("YEAR", Sequelize.col("tanggal_surat")),
          year
        ),
      ],
    },
    order: [["created_at", "DESC"]],
  });

  let nextNumber = 1;
  if (lastSurat) {
    const parts = lastSurat.nomor_surat.split("/");
    const lastNumber = parseInt(parts[0]);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const nomorUrut = nextNumber.toString().padStart(3, "0");
  const bulanRomawi = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ][month];

  return `${nomorUrut}/${prefix}/${bulanRomawi}/${year}`;
};

// Create Surat
export const createSurat = async (req, res) => {
  try {
    const { jenis_surat, perihal, tanggal_surat, asal_tujuan } = req.body;
    const user_id = req.session.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File wajib diunggah" });
    }

    // Generate nomor surat otomatis
    const nomor_surat = await generateNomorSurat(jenis_surat);
    const relativePath = path.relative(
          path.join(__dirname, "../../uploads"),
          req.file.path
        );

    const newSurat = await Surat.create({
      jenis_surat,
      nomor_surat,
      perihal,
      tanggal_surat,
      asal_tujuan,
      file_path: relativePath,
      user_id,
    });

    res.status(201).json({
      message: "Surat berhasil dibuat",
      data: newSurat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Surat (dengan filter dan pencarian)
export const getAllSurat = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const jenis = req.query.jenis || "";
  const status = req.query.status || "";
  const tahun = req.query.tahun || "";
  const offset = limit * page;

  try {
    const whereCondition = {};

     if (search) {
      whereCondition[Op.or] = [
        { nomor_surat: { [Op.substring]: search } },
        { perihal: { [Op.substring]: search } },
        { asal_tujuan: { [Op.substring]: search } },
      ];
    }

    if (jenis) {
      whereCondition.jenis_surat  = jenis;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (tahun) {
      whereCondition.tanggal_surat = {
        [Op.between]: [new Date(`${tahun}-01-01`), new Date(`${tahun}-12-31`)],
      };
    }
   

    const result = await Surat.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
          required: false,
        },
      ],
      offset,
      imit: limit,
      order: [["tanggal_surat", "DESC"]],
    });

    const totalRows = result.count;
    const totalPage = Math.ceil(totalRows / limit);

    res.json({
      result: result.rows,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Surat by ID
export const getSuratById = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    res.json(surat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download Surat File
export const downloadSuratFile = async (req, res) => {
 try {
    const surat = await Surat.findByPk(req.params.id);
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    // Perbaikan path file
    const filePath = path.join(
       process.cwd(),
      'uploads', // Langsung ke folder uploads
      surat.file_path
    );

    console.log('Mencoba mengakses file:', filePath); // Debugging

    if (!fs.existsSync(filePath)) {
      console.error('File tidak ditemukan di:', filePath);
      return res.status(404).json({ message: "File tidak ditemukan" });
    }

    const ext = path.extname(surat.file_path).toLowerCase();
    const contentType =
      ext === ".pdf" ? "application/pdf" : "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(surat.file_path)}"`
    );

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Surat
export const updateSurat = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id);
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    const { jenis_surat, perihal, tanggal_surat, asal_tujuan } = req.body;
    const file = req.file;

    // Jika update file, hapus file lama
    if (file) {
      // Hapus file lama jika ada
      if (surat.file_path) {
        const oldFilePath = path.join(process.cwd(), surat.file_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      surat.file_path = file.path;
    }

    // Update data
    surat.jenis_surat = jenis_surat || surat.jenis_surat;
    surat.perihal = perihal || surat.perihal;
    surat.tanggal_surat = tanggal_surat || surat.tanggal_surat;
    surat.asal_tujuan = asal_tujuan || surat.asal_tujuan;

    await surat.save();
    res.json({ message: "Surat berhasil diperbarui", data: surat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Surat
export const deleteSurat = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id);
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    // Hapus file
    const filePath = path.join(process.cwd(), surat.file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await surat.destroy();
    res.json({ message: "Surat berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Status Surat
export const updateStatusSurat = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id);
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    const { status } = req.body;
    const validStatus = [
      "draft",
      "menunggu_persetujuan",
      "disetujui",
      "ditolak",
      "selesai",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    surat.status = status;
    await surat.save();
    res.json({ message: "Status surat berhasil diperbarui", data: surat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Disposisi Surat
export const disposisiSurat = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id);
    if (!surat) {
      return res.status(404).json({ message: "Surat tidak ditemukan" });
    }

    const { disposisi } = req.body;
    surat.disposisi = disposisi;
    await surat.save();
    res.json({ message: "Disposisi berhasil ditambahkan", data: surat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const formatTanggal = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('id-ID', options);
};

// Fungsi untuk format tanggal dengan waktu
const formatWaktu = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  const options = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return d.toLocaleString('id-ID', options);
};

// Cetak Bukti Surat
export const cetakSurat = async (req, res) => {
  try {
    const surat = await Surat.findByPk(req.params.id, {
      include: [{ model: User, as: "user" }]
    });

    if (!surat) {
      // Khusus untuk cetak, gunakan error page PDF
      return res.status(404).send('Surat tidak ditemukan');
    }

    const doc = new PDFDocument();
    const fileName = `bukti-surat-${surat.nomor_surat}.pdf`;
    
    // Tangani error pada stream PDF
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).send('Gagal menghasilkan PDF');
      }
    });

    // Set header PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);

    doc.pipe(res);

    // Gunakan path relatif yang lebih aman
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    
    // Gunakan metode async untuk cek file
    try {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { width: 50 });
      }
    } catch (e) {
      console.error('Error loading logo:', e);
    }

    doc.fontSize(16).text("BUKTI SURAT", { align: "center" });
    doc.moveDown();

    // Informasi surat
    doc.fontSize(12).text(`Nomor Surat: ${surat.nomor_surat}`);
    doc.text(
      `Jenis Surat: ${
        surat.jenis_surat === "masuk" ? "Surat Masuk" : "Surat Keluar"
      }`
    );
    doc.text(`Perihal: ${surat.perihal}`);
    doc.text(`Tanggal Surat: ${formatTanggal(surat.tanggal_surat)}`);
    doc.text(`Asal/Tujuan: ${surat.asal_tujuan}`);
    doc.text(`Status: ${surat.status}`);

    if (surat.disposisi) {
      doc.moveDown();
      doc.text("Disposisi:");
      doc.text(surat.disposisi, { indent: 20 });
    }

    doc.moveDown();
    doc.text(`Pembuat: ${surat.user.username}`);

    // Footer
    doc.moveDown(3);
    doc.text(`Dicetak pada: ${formatWaktu(new Date())}`, { align: "right" });

    doc.end();
  } catch (error) {
    console.error('Cetak error:', error);
    // Cek jika header belum terkirim
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    } else {
      // Jika header sudah terkirim, tutup stream
      res.end();
    }
  }
};
