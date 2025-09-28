import Document from '../models/dokumen.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all documents with filtering
export const getDocuments = async (req, res) => {
  try {
    const { category, subCategory, search, page = 1, limit = 10 } = req.query;
    
    let whereClause = { isActive: true };
    
    if (category) whereClause.category = category;
    if (subCategory) whereClause.subCategory = subCategory;
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          association: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil data dokumen'
    });
  }
};

// Upload new document
export const uploadDocument = async (req, res) => {
  try {
    const { title, description, category, subCategory, version } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File harus diupload'
      });
    }
    
    const document = await Document.create({
      title,
      description,
      category,
      subCategory,
      version: version || '1.0',
      filePath: req.file.path,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: req.userId
    });
    
    // Populate uploader info
    const docWithUploader = await Document.findByPk(document.id, {
      include: [
        {
          association: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      message: 'Dokumen berhasil diupload',
      data: docWithUploader
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Hapus file yang sudah diupload jika terjadi error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: 'Gagal mengupload dokumen'
    });
  }
};

// Download document
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Dokumen tidak ditemukan'
      });
    }
    
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File tidak ditemukan'
      });
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    res.setHeader('Content-Type', document.mimeType);
    
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengunduh dokumen'
    });
  }
};

// Update document
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, subCategory, version, isActive } = req.body;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Dokumen tidak ditemukan'
      });
    }
    
    await document.update({
      title: title || document.title,
      description: description || document.description,
      category: category || document.category,
      subCategory: subCategory || document.subCategory,
      version: version || document.version,
      isActive: isActive !== undefined ? isActive : document.isActive
    });
    
    const updatedDoc = await Document.findByPk(id, {
      include: [
        {
          association: 'uploader',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Dokumen berhasil diperbarui',
      data: updatedDoc
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal memperbarui dokumen'
    });
  }
};

// Delete document
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Dokumen tidak ditemukan'
      });
    }
    
    // Hapus file fisik
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    await document.destroy();
    
    res.json({
      success: true,
      message: 'Dokumen berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal menghapus dokumen'
    });
  }
};

// Get document categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Document.findAll({
      attributes: ['category', 'subCategory'],
      where: { isActive: true },
      group: ['category', 'subCategory'],
      order: [['category', 'ASC'], ['subCategory', 'ASC']]
    });
    
    // Format categories
    const formattedCategories = {};
    categories.forEach(item => {
      if (!formattedCategories[item.category]) {
        formattedCategories[item.category] = [];
      }
      if (item.subCategory && !formattedCategories[item.category].includes(item.subCategory)) {
        formattedCategories[item.category].push(item.subCategory);
      }
    });
    
    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Gagal mengambil kategori dokumen'
    });
  }
};