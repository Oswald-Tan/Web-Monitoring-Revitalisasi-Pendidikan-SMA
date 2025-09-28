import db from "../config/database.js";
import Assignment from "../models/assignment.js";
import School from "../models/school.js";
import SchoolDetail from "../models/school_detail.js";
import User from "../models/user.js";
import { Op } from "sequelize";

export const addSchool = async (req, res) => {
  try {
    const {
      name,
      kabupaten,
      location,
      progress,
      facilitator_id,
      status,
      nilaiBanper,
      durasi,
      startDate,
      finishDate,
    } = req.body;

    if (
      !name ||
      !kabupaten ||
      !location ||
      !nilaiBanper ||
      !durasi ||
      !startDate ||
      !finishDate
    ) {
      return res.status(400).json({
        message:
          "Nama, kabupaten, lokasi, nilaiBanper, durasi, startDate, dan finishDate wajib diisi",
      });
    }

    if (facilitator_id) {
      const facilitator = await User.findByPk(facilitator_id);
      if (!facilitator) {
        return res.status(404).json({ message: "Fasilitator tidak ditemukan" });
      }
    }

    const newSchool = await School.create({
      name,
      kabupaten,
      location,
      progress: progress || 0,
      facilitator_id: facilitator_id || null,
      status: status || "on-track",
      nilaiBanper,
      durasi,
      startDate,
      finishDate,
    });

    return res.status(201).json({
      message: "Sekolah berhasil ditambahkan",
      data: newSchool,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSchools = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "";
  const offset = limit * page;

  try {
    const whereCondition = {
      ...(search && { name: { [Op.substring]: search } }),
      ...(status && { status }),
    };

    const totalRows = await School.count({ where: whereCondition });

    const totalPage = Math.ceil(totalRows / limit);

    const schools = await School.findAll({
      where: whereCondition,
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: { status: "active" },
          required: false,
          include: [
            {
              model: User,
              as: "facilitator",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["name", "ASC"]],
      offset,
      limit,
    });

    // mapping supaya ada facilitator_name di root object
    const mappedData = schools.map((s) => ({
      id: s.id,
      name: s.name,
      kabupaten: s.kabupaten,
      location: s.location,
      progress: s.progress,
      status: s.status,
      nilaiBanper: s.nilaiBanper,
      durasi: s.durasi,
      startDate: s.startDate,
      finishDate: s.finishDate,
      created_at: s.created_at,
      updated_at: s.updated_at,
      facilitator_name:
        s.assignments.length > 0 ? s.assignments[0].facilitator?.name : null,
    }));

    res.status(200).json({
      data: mappedData,
      page,
      limit,
      totalPage,
      totalRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data sekolah" });
  }
};

export const getSchoolsForAdmin = async (req, res) => {
  try {
    if (req.role === "admin_sekolah") {
      // Admin sekolah lihat sekolah miliknya
      const schools = await School.findAll({
        where: { admin_id: req.userId },
        include: [
          {
            model: Assignment,
            as: "assignments",
            where: { status: "active" },
            required: false,
            include: [
              {
                model: User,
                as: "facilitator",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });

      const mappedData = schools.map((s) => ({
        id: s.id,
        name: s.name,
        kabupaten: s.kabupaten,
        location: s.location,
        progress: s.progress,
        status: s.status,
        nilaiBanper: s.nilaiBanper,
        durasi: s.durasi,
        startDate: s.startDate,
        finishDate: s.finishDate,
        created_at: s.created_at,
        updated_at: s.updated_at,
        facilitator_name:
          s.assignments.length > 0 ? s.assignments[0].facilitator?.name : null,
      }));

      return res.status(200).json({ data: mappedData });
    } else if (req.role === "fasilitator") {
      // Fasilitator lihat sekolah tempat dia ditugaskan
      const assignments = await Assignment.findAll({
        where: { facilitator_id: req.userId, status: "active" },
        include: [
          {
            model: School,
            as: "school",
            include: [
              {
                model: Assignment,
                as: "assignments",
                where: { status: "active" },
                required: false,
                include: [
                  {
                    model: User,
                    as: "facilitator",
                    attributes: ["id", "name"],
                  },
                ],
              },
            ],
          },
        ],
      });

      const mappedData = assignments.map((a) => ({
        id: a.school.id,
        name: a.school.name,
        kabupaten: a.school.kabupaten,
        location: a.school.location,
        progress: a.school.progress,
        status: a.school.status,
        nilaiBanper: a.school.nilaiBanper,
        durasi: a.school.durasi,
        startDate: a.school.startDate,
        finishDate: a.school.finishDate,
        created_at: a.school.created_at,
        updated_at: a.school.updated_at,
        facilitator_name:
          a.school.assignments.length > 0
            ? a.school.assignments[0].facilitator?.name
            : null,
      }));

      return res.status(200).json({ data: mappedData });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data sekolah" });
  }
};

export const getSchoolNames = async (req, res) => {
  try {
    const schools = await School.findAll({
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });

    res.status(200).json(schools);
  } catch (error) {
    console.error("Error fetching school names:", error);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan saat mengambil data sekolah." });
  }
};

// controllers/schoolController.js

export const updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      kabupaten,
      location,
      progress,
      facilitator_id,
      status,
      nilaiBanper,
      durasi,
      startDate,
      finishDate,
    } = req.body;

    const school = await School.findByPk(id);
    if (!school) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan" });
    }

    if (facilitator_id) {
      const facilitator = await User.findByPk(facilitator_id);
      if (!facilitator) {
        return res.status(404).json({ message: "Fasilitator tidak ditemukan" });
      }
    }

    await school.update({
      name,
      kabupaten,
      location,
      progress: progress || school.progress,
      facilitator_id: facilitator_id || school.facilitator_id,
      status: status || school.status,
      nilaiBanper,
      durasi,
      startDate,
      finishDate,
    });

    return res.status(200).json({
      message: "Sekolah berhasil diperbarui",
      data: school,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSchoolById = async (req, res) => {
  try {
    const { id } = req.params;
    const school = await School.findByPk(id, {
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: { status: "active" },
          required: false,
          include: [
            {
              model: User,
              as: "facilitator",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!school) {
      return res.status(404).json({ message: "Sekolah tidak ditemukan" });
    }

    return res.status(200).json({
      message: "Sekolah ditemukan",
      data: school,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSchoolsLandingPage = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const kabupaten = req.query.kabupaten || "";
  const offset = limit * page;

  try {
    const whereCondition = {
      ...(kabupaten && { kabupaten }), // Filter by kabupaten
    };

    const totalRows = await School.count({ where: whereCondition });
    const totalPage = Math.ceil(totalRows / limit);

    const schools = await School.findAll({
      where: whereCondition,
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: { status: "active" },
          required: false,
          include: [
            {
              model: User,
              as: "facilitator",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: SchoolDetail,
          attributes: ["foto_progress"],
        },
      ],
      order: [["name", "ASC"]],
      offset,
      limit,
    });

    const mappedData = schools.map((s) => ({
      id: s.id,
      name: s.name,
      kabupaten: s.kabupaten,
      location: s.location,
      progress: s.progress,
      status: s.status,
      nilaiBanper: s.nilaiBanper,
      durasi: s.durasi,
      startDate: s.startDate,
      finishDate: s.finishDate,
      created_at: s.created_at,
      updated_at: s.updated_at,
      facilitator_name:
        s.assignments.length > 0 ? s.assignments[0].facilitator?.name : null,
      hasPhotos:
        s.SchoolDetail &&
        s.SchoolDetail.foto_progress &&
        (typeof s.SchoolDetail.foto_progress === "string"
          ? JSON.parse(s.SchoolDetail.foto_progress).length > 0
          : s.SchoolDetail.foto_progress.length > 0),
    }));

    res.status(200).json({
      data: mappedData,
      page,
      limit,
      totalPage,
      totalRows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data sekolah" });
  }
};

// Controller untuk mendapatkan daftar kabupaten unik
export const getKabupatenList = async (req, res) => {
  try {
    const kabupatenList = await School.findAll({
      attributes: ["kabupaten"],
      group: ["kabupaten"],
      order: [["kabupaten", "ASC"]],
    });

    const kabupaten = kabupatenList.map((k) => k.kabupaten);
    res.status(200).json(kabupaten);
  } catch (error) {
    console.error("Error fetching kabupaten list:", error);
    res.status(500).json({ message: "Gagal mengambil data kabupaten" });
  }
};

// Get progress per kabupaten
export const getProgressByKabupaten = async (req, res) => {
  try {
    const progressData = await School.findAll({
      attributes: [
        "kabupaten",
        [db.fn("AVG", db.col("progress")), "average_progress"],
        [db.fn("COUNT", db.col("id")), "total_schools"],
      ],
      group: ["kabupaten"],
      order: [["kabupaten", "ASC"]],
      raw: true,
    });

    // Format data
    const formattedData = progressData.map((item) => ({
      kabupaten: item.kabupaten,
      progress: Math.round(parseFloat(item.average_progress)),
      total_schools: parseInt(item.total_schools),
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching progress by kabupaten:", error);
    res
      .status(500)
      .json({ message: "Gagal mengambil data progress kabupaten" });
  }
};

// Get project status count
export const getProjectStatusCount = async (req, res) => {
  try {
    const statusData = await School.findAll({
      attributes: ["status", [db.fn("COUNT", db.col("id")), "count"]],
      group: ["status"],
      raw: true,
    });

    // Format data
    const formattedData = statusData.map((item) => ({
      status: item.status,
      count: parseInt(item.count),
    }));

    // Hitung total dan persentase
    const total = formattedData.reduce((sum, item) => sum + item.count, 0);
    const dataWithPercentage = formattedData.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
    }));

    res.status(200).json({
      status_count: dataWithPercentage,
      total_projects: total,
    });
  } catch (error) {
    console.error("Error fetching project status count:", error);
    res.status(500).json({ message: "Gagal mengambil data status proyek" });
  }
};

export const getGalleryData = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 12;
    const offset = page * limit;

    // Query untuk mendapatkan sekolah yang memiliki foto progress
    const { count, rows } = await School.findAndCountAll({
      include: [
        {
          model: SchoolDetail,
          required: true,
          where: {
            foto_progress: {
              [Op.ne]: null,
              [Op.ne]: "[]",
            },
          },
        },
      ],
      order: [["name", "ASC"]],
      offset,
      limit,
    });

    const totalPage = Math.ceil(count / limit);

    // Format data untuk galeri dengan error handling
    const galleryData = rows
      .map((school) => {
        let photos = [];
        
        try {
          photos = school.SchoolDetail && school.SchoolDetail.foto_progress
            ? (typeof school.SchoolDetail.foto_progress === "string"
                ? JSON.parse(school.SchoolDetail.foto_progress)
                : school.SchoolDetail.foto_progress)
            : [];
        } catch (error) {
          console.error('Error parsing foto_progress:', error);
          photos = [];
        }

        // Filter photos yang valid
        const validPhotos = photos.filter(photo => 
          photo && photo.filename && typeof photo.filename === 'string' && photo.filename.trim() !== ''
        );

        return {
          schoolId: school.id,
          schoolName: school.name,
          kabupaten: school.kabupaten,
          photos: validPhotos.map((photo) => ({
            id: photo.id || Math.random(),
            caption: photo.caption || "",
            filename: photo.filename,
            milestone: photo.milestone || 0,
            type: getPhotoType(photo.milestone),
          })),
        };
      })
      .filter((item) => item.photos.length > 0);

    res.status(200).json({
      data: galleryData,
      page,
      limit,
      totalPage,
      totalRows: count,
    });
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    res.status(500).json({ message: "Gagal mengambil data galeri" });
  }
};

// Helper function untuk menentukan jenis foto berdasarkan milestone
const getPhotoType = (milestone) => {
  if (milestone === 0) return "before";
  if (milestone === 100) return "after";
  return "progress";
};
