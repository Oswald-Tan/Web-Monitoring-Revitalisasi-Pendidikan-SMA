import Contact from '../models/contact.js';
import { validationResult } from 'express-validator';

export const submitContact = async (req, res) => {
  try {
    // Validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Data yang dikirim tidak valid',
        errors: errors.array()
      });
    }

    const { name, email, message } = req.body;

    // Dapatkan informasi client
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get('User-Agent');

    // Simpan ke database
    const contact = await Contact.create({
      name,
      email,
      message,
      ip_address,
      user_agent
    });

    // TODO: Kirim email notifikasi ke admin (bisa ditambahkan later)
    // sendEmailNotification(contact);

    res.status(201).json({
      success: true,
      message: 'Pesan berhasil dikirim. Tim kami akan segera merespons.',
      data: {
        id: contact.id,
        name: contact.name,
        email: contact.email,
        submitted_at: contact.created_at
      }
    });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi nanti.'
    });
  }
};

export const getContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: messages } = await Contact.findAndCountAll({
      order: [['created_at', 'DESC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data pesan'
    });
  }
};

export const updateMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const message = await Contact.findByPk(id);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Pesan tidak ditemukan'
      });
    }

    await message.update({ status });

    res.json({
      success: true,
      message: 'Status pesan berhasil diperbarui',
      data: message
    });

  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui status pesan'
    });
  }
};