import CalendarEvent from "../models/calendar_event.js";
import School from "../models/school.js";
import User from "../models/user.js";
import { Op } from "sequelize";

export const getCalendarEvents = async (req, res) => {
  try {
    const { month, year, schoolId } = req.query;

    let whereClause = {};

    if (month && year) {
      // Pastikan menggunakan waktu Indonesia (UTC+7)
      const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

      whereClause.startDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (schoolId) {
      whereClause.schoolId = schoolId;
    }

    const events = await CalendarEvent.findAll({
      where: whereClause,
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["startDate", "ASC"]],
    });

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error("Error getting calendar events:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data kalender kegiatan",
    });
  }
};

export const createCalendarEvent = async (req, res) => {
  try {
    const {
      schoolId,
      title,
      description,
      startDate,
      endDate,
      eventType,
      participants,
      location,
    } = req.body;

    // Validasi required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: "Judul, tanggal mulai, dan tanggal akhir harus diisi",
      });
    }

    const event = await CalendarEvent.create({
      schoolId,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      eventType,
      participants,
      location,
      createdBy: req.userId,
      status: "scheduled",
    });

    // Dapatkan data lengkap dengan relasi
    const newEvent = await CalendarEvent.findByPk(event.id, {
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Kegiatan berhasil ditambahkan",
      data: newEvent,
    });
  } catch (error) {
    console.error("Error creating calendar event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menambahkan kegiatan",
    });
  }
};

export const updateCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await CalendarEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Kegiatan tidak ditemukan",
      });
    }

    await event.update(updates);

    // Dapatkan data terbaru dengan relasi
    const updatedEvent = await CalendarEvent.findByPk(id, {
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Kegiatan berhasil diperbarui",
      data: updatedEvent,
    });
  } catch (error) {
    console.error("Error updating calendar event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui kegiatan",
    });
  }
};

export const deleteCalendarEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await CalendarEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        error: "Kegiatan tidak ditemukan",
      });
    }

    await event.destroy();

    res.json({
      success: true,
      message: "Kegiatan berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus kegiatan",
    });
  }
};
