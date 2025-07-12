import { Dosen } from "../models/dosen.js";
import JadwalMatkul from "../models/jadwal_matkul.js";
import Kelas from "../models/kelas.js";
import Matkul from "../models/matkul.js";
import moment from "moment";
import { Op } from "sequelize";

export const createJadwalMatkul = async (req, res) => {
  const {
    prodiAdmin,
    idMatkul,
    idKelas,
    hari,
    ruangan,
    jam_matkul,
    dosen_pengajar,
  } = req.body;

  // Validasi semua field wajib diisi
  if (
    !idMatkul ||
    !idKelas ||
    !hari ||
    !ruangan ||
    !jam_matkul ||
    !dosen_pengajar
  ) {
    return res.status(400).json({
      error: "Semua field wajib diisi",
      success: false,
    });
  }

  // Pisahkan jam mulai dan selesai
  const [jamMulai, jamSelesai] = jam_matkul.split(" - ");

  // Validasi format jam
  if (
    !moment(jamMulai, "HH:mm", true).isValid() ||
    !moment(jamSelesai, "HH:mm", true).isValid()
  ) {
    return res.status(400).json({
      error: "Format jam tidak valid. Gunakan format HH:mm (contoh: 08:00)",
      success: false,
    });
  }

  // Konversi ke moment object untuk perbandingan
  const startTime = moment(jamMulai, "HH:mm");
  const endTime = moment(jamSelesai, "HH:mm");

  // Validasi urutan jam
  if (endTime.isSameOrBefore(startTime)) {
    return res.status(400).json({
      error: "Jam selesai harus setelah jam mulai",
      success: false,
    });
  }

  // Waktu istirahat
  const breakTimes = [
    { start: "10:15", end: "10:45" },
    { start: "12:25", end: "12:55" },
  ];

  // Cek apakah jadwal masuk waktu istirahat
  const isDuringBreak = breakTimes.some((breakTime) => {
    const breakStart = moment(breakTime.start, "HH:mm");
    const breakEnd = moment(breakTime.end, "HH:mm");

    return startTime.isBefore(breakEnd) && endTime.isAfter(breakStart);
  });

  if (isDuringBreak) {
    return res.status(400).json({
      message: "Jadwal bertabrakan dengan waktu istirahat",
      success: false,
    });
  }

  try {
    // PERBAIKAN: Cek konflik untuk kelas secara khusus terlebih dahulu
    // Karena satu kelas tidak boleh memiliki dua jadwal di jam yang sama
    const existingClassSchedules = await JadwalMatkul.findAll({
      where: {
        hari: hari,
        idKelas: idKelas,
      },
    });

    // Konversi jam baru ke menit
    const newStartMinutes = startTime.hours() * 60 + startTime.minutes();
    const newEndMinutes = endTime.hours() * 60 + endTime.minutes();

    // 1. Cek konflik untuk kelas yang sama
    const classConflict = existingClassSchedules.some((schedule) => {
      const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");

      const existingStartMoment = moment(existingStart, "HH:mm");
      const existingEndMoment = moment(existingEnd, "HH:mm");

      const existingStartMinutes =
        existingStartMoment.hours() * 60 + existingStartMoment.minutes();
      const existingEndMinutes =
        existingEndMoment.hours() * 60 + existingEndMoment.minutes();

      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      );
    });

    if (classConflict) {
      return res.status(409).json({
        message: "Kelas sudah memiliki jadwal lain pada jam tersebut",
        success: false,
      });
    }

    // 2. Cek konflik untuk dosen dan ruangan
    const existingOtherSchedules = await JadwalMatkul.findAll({
      where: {
        hari: hari,
        [Op.or]: [{ dosen_pengajar: dosen_pengajar }, { ruangan: ruangan }],
      },
    });

    // Cek bentrok untuk dosen dan ruangan
    const otherConflict = existingOtherSchedules.some((schedule) => {
      const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");

      const existingStartMoment = moment(existingStart, "HH:mm");
      const existingEndMoment = moment(existingEnd, "HH:mm");

      const existingStartMinutes =
        existingStartMoment.hours() * 60 + existingStartMoment.minutes();
      const existingEndMinutes =
        existingEndMoment.hours() * 60 + existingEndMoment.minutes();

      // Cek overlap waktu
      const timeConflict =
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes;

      // Cek jenis konflik
      const isSameDosen = schedule.dosen_pengajar === dosen_pengajar;
      const isSameRuangan = schedule.ruangan === ruangan;

      return timeConflict && (isSameDosen || isSameRuangan);
    });

    if (otherConflict) {
      // Deteksi jenis konflik spesifik
      const conflictSchedule = existingOtherSchedules.find((schedule) => {
        const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");
        const existingStartMoment = moment(existingStart, "HH:mm");
        const existingEndMoment = moment(existingEnd, "HH:mm");
        const existingStartMinutes =
          existingStartMoment.hours() * 60 + existingStartMoment.minutes();
        const existingEndMinutes =
          existingEndMoment.hours() * 60 + existingEndMoment.minutes();

        const timeConflict =
          newStartMinutes < existingEndMinutes &&
          newEndMinutes > existingStartMinutes;

        return timeConflict;
      });

      if (!conflictSchedule) {
        return res.status(409).json({
          message: "Terjadi konflik jadwal",
          success: false,
        });
      }

      let errorMessage = "Konflik jadwal: ";
      if (conflictSchedule.dosen_pengajar === dosen_pengajar) {
        errorMessage += "Dosen sudah mengajar di kelas lain pada jam tersebut";
      } else if (conflictSchedule.ruangan === ruangan) {
        errorMessage += "Ruangan sudah digunakan kelas lain pada jam tersebut";
      } else {
        errorMessage += "Terjadi konflik jadwal";
      }

      return res.status(409).json({
        message: errorMessage,
        success: false,
      });
    }

    // Buat jadwal baru
    await JadwalMatkul.create({
      prodiAdmin: prodiAdmin,
      idMatkul: idMatkul,
      idKelas: idKelas,
      hari: hari,
      ruangan: ruangan,
      jam_matkul: jam_matkul,
      dosen_pengajar: dosen_pengajar,
    });

    return res.status(201).json({
      message: "Jadwal berhasil ditambahkan",
      success: true,
    });
  } catch (error) {
    console.error("Error creating schedule:", error);

    // Handle specific errors
    let errorMessage = "Terjadi kesalahan server";
    if (error.name === "SequelizeDatabaseError") {
      errorMessage = "Kesalahan database: " + error.message;
    } else if (error.name === "SequelizeValidationError") {
      errorMessage =
        "Validasi data gagal: " + error.errors.map((e) => e.message).join(", ");
    }

    return res.status(500).json({
      error: errorMessage,
      success: false,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const list = async (req, res) => {
  const prodi = req.query.prodi;
  const kelas = req.query.kelas;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = limit * page;

  try {
    const whereCondition = {};

    if (prodi) {
      whereCondition.prodiAdmin = prodi;
    }

      if (kelas) {
      whereCondition.idKelas = kelas; // Di model, foreign key untuk kelas adalah kelasId
    }

    const searchCondition = search
      ? {
          [Op.or]: [
            // Pencarian di tabel JadwalMatkul
            { hari: { [Op.substring]: search } },
            { ruangan: { [Op.substring]: search } },
            { jam_matkul: { [Op.substring]: search } },
            
            // Pencarian di tabel Matkul (relasi)
            { '$Matkul.mata_kuliah$': { [Op.substring]: search } },
            { '$Matkul.kode_matkul$': { [Op.substring]: search } },
            
            // Pencarian di tabel lainnya jika diperlukan
            { '$Dosen.fullname$': { [Op.substring]: search } },
            { '$Kela.nama_kelas$': { [Op.substring]: search } }
          ]
        }
      : {};


    const { count, rows } = await JadwalMatkul.findAndCountAll({
       where: {
        ...whereCondition,
        ...searchCondition
      },
      include: [
        { model: Matkul },
        { model: Kelas },
        { 
          model: Dosen,
          attributes: ["id", "fullname"],
        },
      ],
      offset: offset,
      limit: limit,
    });

   const totalPage = Math.ceil(count / limit);

    return res.status(200).json({
      result: rows,
      page: page,
      limit: limit,
      totalRows: count,
      totalPage: totalPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  const id = req.params.id;

  try {
    await JadwalMatkul.destroy({ where: { id: id } });

    return res
      .status(200)
      .json({ message: "Data berhasil dihapus", success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getByDay = async (req, res) => {
  const hari = req.params.hari;
  const kelas = req.query.kelas;

  try {
    const result = await JadwalMatkul.findAll({
      where: { hari: hari, idKelas: kelas },
      include: [
        {
          model: Matkul,
        },
        {
          model: Kelas,
        },
        {
          model: Dosen,
          attributes: ["id", "fullname"],
        },
      ],
    });

    return res.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// list jadwal berdasarkan dosen
export const listDosen = async (req, res) => {
  const dosenPengajar = req.query.dosenPengajar;
  const hari = req.query.hari;

  try {
    const result = await Jadwal.findAll({
      where: { dosenPengajar: dosenPengajar, hari: hari },
      include: [
        {
          model: Matkul,
        },
        {
          model: Kelas,
        },
      ],
    });

    return res.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// tampilkan jadwal pada dosen berdasarkan lab
export const listDosenByLab = async (req, res) => {
  const hari = req.query.hari;
  const lab = req.query.lab;

  try {
    const result = await Jadwal.findAll({
      where: { hari: hari, ruangan: lab },
      include: [
        {
          model: Matkul,
        },
        {
          model: Kelas,
        },
      ],
    });

    return res.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

//menampilkan jadwal hanya dosen yang sedang login atau hanya jadwal dosen tersebut saja
export const listJadwalDosen = async (req, res) => {
  const dosenPengajar = req.query.dosenPengajar;
  const hari = req.params.hari;

  try {
    const result = await Jadwal.findAll({
      where: { dosenPengajar: dosenPengajar, hari: hari },
      include: [
        {
          model: Matkul,
        },
        {
          model: Kelas,
        },
      ],
    });

    return res.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const updateJadwalMatkul = async (req, res) => {
  const { id } = req.params;
  const {
    idMatkul,
    idKelas,
    hari,
    ruangan,
    jam_matkul,
    dosen_pengajar,
    prodiAdmin,
  } = req.body;

  // Validasi semua field wajib diisi
  if (
    !idMatkul ||
    !idKelas ||
    !hari ||
    !ruangan ||
    !jam_matkul ||
    !dosen_pengajar ||
    !prodiAdmin
  ) {
    return res.status(400).json({
      success: false,
      message: "Semua field harus diisi",
    });
  }

  // Pisahkan jam mulai dan selesai
  const [jamMulai, jamSelesai] = jam_matkul.split(" - ");

  // Konversi ke moment object
  const startTime = moment(jamMulai, "HH:mm");
  const endTime = moment(jamSelesai, "HH:mm");

  // Validasi format jam
  if (!startTime.isValid() || !endTime.isValid()) {
    return res.status(400).json({
      error: "Format jam tidak valid. Gunakan format HH:mm (contoh: 08:00)",
      success: false,
    });
  }

  // Validasi urutan jam
  if (endTime.isSameOrBefore(startTime)) {
    return res.status(400).json({
      error: "Jam selesai harus setelah jam mulai",
      success: false,
    });
  }

  // Waktu istirahat
  const breakTimes = [
    { start: "10:15", end: "10:45" },
    { start: "12:25", end: "12:55" },
  ];

  // Cek apakah jadwal masuk waktu istirahat
  const isDuringBreak = breakTimes.some((breakTime) => {
    const breakStart = moment(breakTime.start, "HH:mm");
    const breakEnd = moment(breakTime.end, "HH:mm");

    return startTime.isBefore(breakEnd) && endTime.isAfter(breakStart);
  });

  if (isDuringBreak) {
    return res.status(400).json({
      message: "Jadwal bertabrakan dengan waktu istirahat",
      success: false,
    });
  }

  try {
    // Cek apakah jadwal ada
    const jadwal = await JadwalMatkul.findByPk(id);
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: "Jadwal tidak ditemukan",
      });
    }

    // PERBAIKAN: Cek konflik untuk kelas secara khusus terlebih dahulu
    const existingClassSchedules = await JadwalMatkul.findAll({
      where: {
        id: { [Op.ne]: id }, // Kecuali jadwal saat ini
        hari: hari,
        idKelas: idKelas,
      },
    });

    // Konversi jam baru ke menit
    const newStartMinutes = startTime.hours() * 60 + startTime.minutes();
    const newEndMinutes = endTime.hours() * 60 + endTime.minutes();

    // 1. Cek konflik untuk kelas yang sama
    const classConflict = existingClassSchedules.some((schedule) => {
      const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");

      const existingStartMoment = moment(existingStart, "HH:mm");
      const existingEndMoment = moment(existingEnd, "HH:mm");

      const existingStartMinutes =
        existingStartMoment.hours() * 60 + existingStartMoment.minutes();
      const existingEndMinutes =
        existingEndMoment.hours() * 60 + existingEndMoment.minutes();

      return (
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes
      );
    });

    if (classConflict) {
      return res.status(409).json({
        message: "Kelas sudah memiliki jadwal lain pada jam tersebut",
        success: false,
      });
    }

    // 2. Cek konflik untuk dosen dan ruangan
    const existingOtherSchedules = await JadwalMatkul.findAll({
      where: {
        id: { [Op.ne]: id }, // Kecuali jadwal saat ini
        hari: hari,
        [Op.or]: [{ dosen_pengajar: dosen_pengajar }, { ruangan: ruangan }],
      },
    });

    // Cek bentrok untuk dosen dan ruangan
    const otherConflict = existingOtherSchedules.some((schedule) => {
      const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");

      const existingStartMoment = moment(existingStart, "HH:mm");
      const existingEndMoment = moment(existingEnd, "HH:mm");

      const existingStartMinutes =
        existingStartMoment.hours() * 60 + existingStartMoment.minutes();
      const existingEndMinutes =
        existingEndMoment.hours() * 60 + existingEndMoment.minutes();

      // Cek overlap waktu
      const timeConflict =
        newStartMinutes < existingEndMinutes &&
        newEndMinutes > existingStartMinutes;

      // Cek jenis konflik
      const isSameDosen = schedule.dosen_pengajar === dosen_pengajar;
      const isSameRuangan = schedule.ruangan === ruangan;

      return timeConflict && (isSameDosen || isSameRuangan);
    });

    if (otherConflict) {
      // Deteksi jenis konflik spesifik
      const conflictSchedule = existingOtherSchedules.find((schedule) => {
        const [existingStart, existingEnd] = schedule.jam_matkul.split(" - ");
        const existingStartMoment = moment(existingStart, "HH:mm");
        const existingEndMoment = moment(existingEnd, "HH:mm");
        const existingStartMinutes =
          existingStartMoment.hours() * 60 + existingStartMoment.minutes();
        const existingEndMinutes =
          existingEndMoment.hours() * 60 + existingEndMoment.minutes();

        const timeConflict =
          newStartMinutes < existingEndMinutes &&
          newEndMinutes > existingStartMinutes;

        return timeConflict;
      });

      if (!conflictSchedule) {
        return res.status(409).json({
          message: "Terjadi konflik jadwal",
          success: false,
        });
      }

      let errorMessage = "Konflik jadwal: ";
      if (conflictSchedule.dosen_pengajar === dosen_pengajar) {
        errorMessage += "Dosen sudah mengajar di kelas lain pada jam tersebut";
      } else if (conflictSchedule.ruangan === ruangan) {
        errorMessage += "Ruangan sudah digunakan kelas lain pada jam tersebut";
      } else {
        errorMessage += "Terjadi konflik jadwal";
      }

      return res.status(409).json({
        message: errorMessage,
        success: false,
      });
    }

    // Update data jadwal
    await JadwalMatkul.update(
      {
        idMatkul,
        idKelas,
        hari,
        ruangan,
        jam_matkul,
        dosen_pengajar,
        prodiAdmin,
      },
      { where: { id } }
    );

    // Ambil data terbaru setelah update
    const updatedJadwal = await JadwalMatkul.findByPk(id, {
      include: [{ model: Matkul }, { model: Kelas }, { model: Dosen }],
    });

    res.status(200).json({
      success: true,
      message: "Jadwal berhasil diperbarui",
      data: updatedJadwal,
    });
  } catch (error) {
    console.error("Error updating jadwal:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Konflik jadwal: Dosen atau ruangan sudah digunakan",
      });
    }

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui jadwal",
      error: error.message,
    });
  }
};
