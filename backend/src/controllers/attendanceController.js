import Attendance from "../models/attendance.js";
import Event from "../models/event.js";
import User from "../models/user.js";
import { Op } from "sequelize";

// Update status kehadiran
export const updateAttendance = async (req, res) => {
  try {
    const { status, notes } = req.body; // Tambahkan notes
    const attendanceId = req.params.id;

    // Dapatkan data attendance beserta event terkait
    const attendance = await Attendance.findByPk(attendanceId, {
      include: [{
        model: Event,
        as: 'event',
        attributes: ['start', 'end']
      }]
    });

    if (!attendance) {
      return res.status(404).json({ message: 'Data kehadiran tidak ditemukan' });
    }

    // Periksa apakah event sudah dimulai
    const now = new Date();
    const eventStart = new Date(attendance.event.start);

    if (now < eventStart) {
      // Format waktu untuk pesan error
      const formattedTime = eventStart.toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return res.status(400).json({ 
        message: `Belum bisa mengisi absen karena belum jam mulai event. Event dimulai pada ${formattedTime}` 
      });
    }

    // Periksa apakah event sudah berakhir
    const eventEnd = new Date(attendance.event.end);
    if (now > eventEnd) {
      const formattedEndTime = eventEnd.toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      return res.status(400).json({ 
        message: `Tidak bisa mengupdate kehadiran karena event sudah berakhir pada ${formattedEndTime}` 
      });
    }

    // Update jika event sudah dimulai dan belum berakhir
    const [updated] = await Attendance.update(
      { 
        status, 
        attended_at: status === 'hadir' ? new Date() : null,
        notes // Tambahkan notes
      },
      { where: { id: attendanceId } }
    );
    
    if (updated) {
      const updatedAttendance = await Attendance.findByPk(attendanceId);
      res.json(updatedAttendance);
    } else {
      res.status(404).json({ message: 'Data kehadiran tidak ditemukan' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Rekap kehadiran per event
export const getEventAttendance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const offset = limit * page;

    // Membuat kondisi pencarian
    let userWhereCondition = {};
    if (search) {
      userWhereCondition = {
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { email: { [Op.substring]: search } }
        ]
      };
    }

    // Query utama dengan findAndCountAll untuk paginasi
    const result = await Attendance.findAndCountAll({
      where: { event_id: eventId },
      include: [
        { 
        model: User,
        as: 'user',
        attributes: ['id', 'fullname', 'email'],
        where: userWhereCondition // Menerapkan kondisi pencarian
      },
      {
        model: Event,
        as: 'event',
        attributes: ['id', 'title', 'start', 'end']
      }
    ],
      order: [['created_at', 'DESC']], // Contoh pengurutan
      offset: offset,
      limit: limit
    });

    // Menghitung metadata paginasi
    const totalRows = result.count;
    const totalPage = Math.ceil(totalRows / limit);
    const attendances = result.rows;

    res.json({
      result: attendances,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};