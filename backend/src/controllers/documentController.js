import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import Document from "../models/document.js";

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload dokumen
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const { title, description, category, access_roles } = req.body;

    // Dapatkan path relatif untuk disimpan di database
    const relativePath = path.relative(path.join(__dirname, '../../'), req.file.path);

    const newDocument = await Document.create({
      title,
      description,
      category,
      file_name: req.file.originalname,
      file_path: relativePath, // Simpan path relatif
      access_roles
    });

    res.status(201).json({
      message: "Dokumen berhasil diupload",
      data: newDocument
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Download dokumen
export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    // Cek hak akses
    const userRoles = req.user.role.split(",");
    const allowedRoles = document.access_roles.split(",");
    
    const hasAccess = allowedRoles.some(role => 
      userRoles.includes(role.trim())
    );

    if (!hasAccess) {
      return res.status(403).json({ message: "Anda tidak memiliki izin untuk mengunduh dokumen ini" });
    }

    // Bangun path absolut
    const filePath = path.join(__dirname, '../../', document.file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File tidak ditemukan di server" });
    }

    // Dapatkan ekstensi file asli
    const ext = path.extname(document.file_name);
    
    // Tentukan Content-Type berdasarkan ekstensi
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Set header sebelum mengirim file
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.file_name}"`);
    
    // Stream file ke client
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get semua dokumen (dengan filter dan paginasi)
export const getAllDocuments = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const category = req.query.category || "";
  const offset = limit * page;

  try {
    const whereCondition = {};
    
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.substring]: search } },
        { description: { [Op.substring]: search } }
      ];
    }
    
    if (category) {
      whereCondition.category = category;
    }

    const result = await Document.findAndCountAll({
      where: whereCondition,
      offset: offset,
      limit: limit,
      order: [['created_at', 'DESC']]
    });

    const totalRows = result.count;
    const totalPage = Math.ceil(totalRows / limit);
    
    res.json({
      result: result.rows,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Hapus dokumen
export const deleteDocument = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Dokumen tidak ditemukan" });
    }

    // Hapus file dari sistem
    if (fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path);
    }

    await document.destroy();
    res.json({ message: "Dokumen berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};