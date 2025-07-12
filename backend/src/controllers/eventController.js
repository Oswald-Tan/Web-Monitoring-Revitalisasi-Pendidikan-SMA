import Attendance from "../models/attendance.js";
import Event from "../models/event.js";
import Notification from "../models/notification.js";
import { sendEventNotification } from "./notificationController.js";
import User from "../models/user.js";
import { Dosen } from "../models/dosen.js";
import { Op } from "sequelize";
import db from "../config/database.js";

export const createEvent = async (req, res) => {
  try {
    const { title, description, start, end, location, type, participants } =
      req.body;

    // Validasi peserta
    if (
      !participants ||
      !Array.isArray(participants) ||
      participants.length === 0
    ) {
      return res.status(400).json({ message: "Daftar peserta tidak valid" });
    }

    // Mapping tipe event

    const event = await Event.create({
      title,
      description,
      start,
      end,
      location,
      type,
      organizer: req.userId, // Menggunakan req.userId dari middleware
    });

    // Buat attendance records untuk peserta
    const attendanceRecords = participants.map((userId) => ({
      event_id: event.id,
      user_id: userId,
      status: "tidak_hadir",
    }));

    await Attendance.bulkCreate(attendanceRecords);

    // Buat notifikasi untuk peserta
    const notifications = participants.map((userId) => ({
      event_id: event.id,
      recipient_id: userId,
      channel: "email",
      scheduled_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 hari sebelum
    }));

    await Notification.bulkCreate(notifications);

    // PERBAIKAN DI SINI: Menggunakan model Dosen yang benar
    const participantsDetails = await User.findAll({
      where: { id: participants },
      include: [
        {
          model: Dosen, // Menggunakan model Dosen
          attributes: ["nip", "nidn", "jurusan", "prodi"],
        },
      ],
    });

    // Kirim email undangan ke semua peserta
    const sendEmailPromises = participantsDetails.map((user) =>
      sendEventNotification(user, event, "invitation")
    );

    await Promise.all(sendEmailPromises);

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "start";
    const sortOrder = req.query.sortOrder || "DESC";
    const offset = limit * page;

    // Konfigurasi kondisi pencarian
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { title: { [Op.substring]: search } },
          { description: { [Op.substring]: search } },
          { location: { [Op.substring]: search } },
          { type: { [Op.substring]: search } },
        ],
      };
    }

    if (status) {
      whereCondition = {
        ...whereCondition,
        status: status,
      };
    }

    // Hitung total event
    const totalEvents = await Event.count({
      where: whereCondition,
    });

    const totalRows = totalEvents;
    const totalPage = Math.ceil(totalRows / limit);

    // Query data dengan pagination dan sorting
    const events = await Event.findAll({
      where: whereCondition,
      order: [[sortBy, sortOrder]],
      offset: offset,
      limit: limit,
      include: [
        {
          model: User,
          as: "organizer_details",
          attributes: ["id", "fullname", "email"],
        },
      ],
    });

    res.status(200).json({
      result: events,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const sortBy = req.query.sortBy || "start";
    const sortOrder = req.query.sortOrder || "DESC";
    const offset = limit * page;

    // Konfigurasi pencarian
    let whereCondition = {
      [Op.and]: [
        search && {
          [Op.or]: [
            { title: { [Op.substring]: search } },
            { description: { [Op.substring]: search } },
            { location: { [Op.substring]: search } },
          ],
        },
      ].filter(Boolean),
    };

    if (status) {
      whereCondition = {
        ...whereCondition,
        status: status,
      };
    }

    // Dapatkan hanya event yang diikuti dosen ini
    const { count, rows } = await Event.findAndCountAll({
      include: [
        {
          model: Attendance,
          as: "attendances",
          where: { user_id: userId },
          required: true,
        },
        {
          model: User,
          as: "organizer_details",
          attributes: ["id", "fullname", "email"],
        },
      ],
      where: whereCondition,
      order: [[sortBy, sortOrder]],
      offset: offset,
      limit: limit,
      distinct: true, // Penting untuk paginasi dengan JOIN
    });

    const totalRows = count;
    const totalPage = Math.ceil(totalRows / limit);

    res.status(200).json({
      result: rows,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// total event upcoming yang diikuti user
export const getTotalUpcomingEvents = async (req, res) => {
  try {
    const userId = req.userId;

    // Hitung total event aktif (upcoming) yang diikuti user
    const totalUpcoming = await Event.count({
      include: [
        {
          model: Attendance,
          as: "attendances",
          where: { user_id: userId },
          required: true,
        },
      ],
      where: {
        status: "upcoming",
      },
    });

    res.json({ totalUpcoming });
  } catch (error) {
    console.error("Error fetching active event count:", error.message);
    res.status(500).json({ message: error.message });
  }
};

//total event ongoing yang diikuti user
export const getTotalOngoingEvents = async (req, res) => {
  try {
    const userId = req.userId;

    // Hitung total event aktif (ongoing) yang diikuti user
    const totalOngoing = await Event.count({
      include: [
        {
          model: Attendance,
          as: "attendances",
          where: { user_id: userId },
          required: true,
        },
      ],
      where: {
        status: "ongoing",
      },
    });

    res.json({ totalOngoing });
  } catch (error) {
    console.error("Error fetching active event count:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// get total event yang statusnya upcoming
export const getUpcomingEventCount = async (req, res) => {
  try {
    const totalUpcoming = await Event.count({
      where: { status: "upcoming" },
    });

    res.json({ totalUpcoming });
  } catch (error) {
    console.error("Error fetching upcoming event count:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// get total event yang statusnya ongoing
export const getOngoingEventCount = async (req, res) => {
  try {
    const totalOngoing = await Event.count({
      where: { status: "ongoing" },
    });

    res.json({ totalOngoing });
  } catch (error) {
    console.error("Error fetching ongoing event count:", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getEventNotifications = async (req, res) => {
  try {
    const eventId = req.params.id;

    // Ambil semua attendance untuk event ini beserta data user
    const attendances = await Attendance.findAll({
      where: { event_id: eventId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname", "email"],
        },
      ],
      attributes: ["id", "reminder_sent", "updated_at"], // Sertakan kolom reminder_sent
    });

    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mendapatkan detail event
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "organizer_details",
          attributes: ["id", "fullname", "email"],
        },
        {
          model: Attendance,
          as: "attendances",
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "fullname", "email"],
            },
          ],
        },
      ],
    });

    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAllEventStatuses = async (req, res) => {
  try {
    await Event.updateStatuses();
    res.json({ message: "Event statuses updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update event
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Simpan nilai waktu lama untuk perbandingan
    const originalStart = event.start;
    const originalEnd = event.end;
    const isOngoing = event.status === "ongoing";

    // Cek jika event ongoing dan mencoba mengubah peserta
    if (isOngoing && req.body.participants) {
      return res.status(400).json({
        message: "Tidak dapat mengubah peserta saat event sedang berlangsung",
      });
    }

    // Flag untuk menandai perubahan waktu
    const startChanged =
      req.body.start &&
      new Date(req.body.start).getTime() !== originalStart.getTime();
    const endChanged =
      req.body.end &&
      new Date(req.body.end).getTime() !== originalEnd.getTime();
    const timeChanged = startChanged || endChanged;

    // Reset reminder hanya jika:
    // - Ada perubahan start time ATAU
    // - End time diubah pada event yang bukan ongoing
    if (timeChanged && (!isOngoing || startChanged)) {
      await Attendance.update(
        { reminder_sent: false },
        { where: { event_id: req.params.id } }
      );
    }

    // Update event (jika ada peserta, hapus dari data yang akan diupdate)
    const { participants, ...updateData } = req.body;
    const [updated] = await Event.update(updateData, {
      where: { id: req.params.id },
    });

    if (updated) {
      const updatedEvent = await Event.findByPk(req.params.id);
      res.json(updatedEvent);
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event
export const deleteEvent = async (req, res) => {
  try {
    const deleted = await Event.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.json({ message: "Event deleted" });
    } else {
      res.status(404).json({ message: "Event not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventStats = async (req, res) => {
  try {
    // Statistik status event
    const upcomingCount = await Event.count({ where: { status: "upcoming" } });
    const ongoingCount = await Event.count({ where: { status: "ongoing" } });
    const completedCount = await Event.count({ where: { status: "completed" } });
    
    // Statistik event per bulan dan per tipe
    const monthlyStats = await Event.findAll({
      attributes: [
        [db.fn('YEAR', db.col('start')), 'year'],
        [db.fn('MONTH', db.col('start')), 'month'],
        [db.fn('COUNT', db.col('id')), 'total'],
        'type'
      ],
      group: ['year', 'month', 'type'],
      order: [['year', 'ASC'], ['month', 'ASC']]
    });

    // Statistik kehadiran global
    const attendanceStats = await Attendance.findAll({
      attributes: [
        'status',
        [db.fn('count', db.col('id')), 'count']
      ],
      group: ['status']
    });

    // Format respons untuk frontend
    const monthlyData = {};
    
    monthlyStats.forEach(stat => {
      const month = `${stat.get('month')}/${stat.get('year')}`;
      const type = stat.get('type');
      const total = stat.get('total');
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          Event: 0,
          Meeting: 0,
          Workshop: 0
        };
      }
      
      monthlyData[month][type] = total;
    });
    
    // Konversi ke array
    const formattedMonthlyStats = Object.values(monthlyData);

    res.json({
      statusStats: {
        upcoming: upcomingCount,
        ongoing: ongoingCount,
        completed: completedCount
      },
      monthlyStats: formattedMonthlyStats,
      attendanceStats: attendanceStats.map(stat => ({
        status: stat.status,
        count: stat.get('count')
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Endpoint untuk statistik kehadiran per event
export const getEventAttendanceStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const stats = await Attendance.findAll({
      attributes: [
        'status',
        [db.fn('count', db.col('id')), 'count']
      ],
      where: { event_id: eventId },
      group: ['status']
    });

    res.json(stats.map(stat => ({
      status: stat.status,
      count: stat.get('count')
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
