import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import Arsip from "../models/arsip.js";
import { logAction } from "../middleware/auditMiddleware.js";

import { fileURLToPath } from "url";
import db from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload arsip baru
export const createArsip = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const {
      judul,
      jenis,
      deskripsi,
      nomor_dokumen,
      tanggal,
      pihak_terkait,
      status,
      meta_kategori,
      meta_penulis,
      meta_departemen,
      meta_tahun,
    } = req.body;

    // Dapatkan path relatif untuk disimpan di database
    const relativePath = path.relative(
      path.join(__dirname, "../../"),
      req.file.path
    );

    const metadata = {};
    if (meta_kategori) metadata.kategori = meta_kategori;
    if (meta_penulis) metadata.penulis = meta_penulis;
    if (meta_departemen) metadata.departemen = meta_departemen;
    if (meta_tahun) metadata.tahun_berlaku = parseInt(meta_tahun);

    const newArsip = await Arsip.create({
      judul,
      jenis,
      deskripsi,
      nomor_dokumen,
      tanggal,
      pihak_terkait,
      status,
      file_path: relativePath,
      metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });

     await logAction(
      req,
      "create",
      "arsip",
      newArsip.id,
      `Membuat arsip baru: ${judul}`,
      null, // oldData
      newArsip.get({ plain: true }) // newData
    );

    res.status(201).json({
      message: "Arsip berhasil disimpan",
      data: newArsip,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get semua arsip dengan filter
export const getAllArsip = async (req, res) => {
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
        { judul: { [Op.substring]: search } },
        { nomor_dokumen: { [Op.substring]: search } },
        { deskripsi: { [Op.substring]: search } },
      ];
    }

    if (jenis) {
      whereCondition.jenis = jenis;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (tahun) {
      whereCondition.tanggal = {
        [Op.between]: [new Date(`${tahun}-01-01`), new Date(`${tahun}-12-31`)],
      };
    }

    const result = await Arsip.findAndCountAll({
      where: whereCondition,
      offset: offset,
      limit: limit,
      order: [["tanggal", "DESC"]],
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

// Download arsip
export const downloadArsip = async (req, res) => {
  try {
    const arsip = await Arsip.findByPk(req.params.id);
    if (!arsip) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    const filePath = path.join(process.cwd(), arsip.file_path);
    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ message: "File tidak ditemukan di server" });
    }

    // Dapatkan ekstensi file asli
    const ext = path.extname(arsip.file_path);

    // Tentukan Content-Type berdasarkan ekstensi
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";

    // Set header sebelum mengirim file
    res.setHeader("Content-Type", contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${path.basename(arsip.file_path)}"`
    );

    // Stream file ke client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update status arsip
export const updateStatusArsip = async (req, res) => {
  try {
    const { status } = req.body;
    const arsip = await Arsip.findByPk(req.params.id);

    if (!arsip) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    arsip.status = status;
    await arsip.save();

    res.json({
      message: "Status arsip berhasil diperbarui",
      data: arsip,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus arsip
export const deleteArsip = async (req, res) => {
  try {
    const arsip = await Arsip.findByPk(req.params.id);
    if (!arsip) {
      return res.status(404).json({ message: "Arsip tidak ditemukan" });
    }

    // Hapus file dari sistem
    if (fs.existsSync(arsip.file_path)) {
      fs.unlinkSync(arsip.file_path);
    }

    await arsip.destroy();
    res.json({ message: "Arsip berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get statistik arsip
export const getArsipStats = async (req, res) => {
  try {
    const stats = await Arsip.findAll({
      attributes: [
        "jenis",
        [db.Sequelize.fn("COUNT", db.Sequelize.col("id")), "total"],
        [db.Sequelize.fn("YEAR", db.Sequelize.col("tanggal")), "tahun"],
      ],
      group: ["jenis", "tahun"],
      order: [["tahun", "DESC"]],
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
