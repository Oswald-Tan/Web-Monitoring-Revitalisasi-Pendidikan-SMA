import School from "../models/school.js";
import SchoolDetail from "../models/school_detail.js";
import { fileURLToPath } from "url";
import path from "path";
import User from "../models/user.js";
import fs from 'fs';
import Assignment from "../models/assignment.js";

// Dapatkan path direktori
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk generate URL akses publik
const generatePublicUrl = (filename) => {
  return `/uploads/school-progress/${filename}`;
};

export const getSchoolDetail = async (req, res) => {
  const { id } = req.params;

  try {
    // Coba ambil detail sekolah + assignments
    const schoolDetail = await SchoolDetail.findOne({
      where: { sekolah_id: id },
      include: [
        {
          model: School,
          as: "School",
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
                  attributes: ["id", "name", "email"],
                },
              ],
            },
          ],
        },
      ],
    });

    const mapSchool = (school) => ({
      id: school.id,
      name: school.name,
      kabupaten: school.kabupaten,
      location: school.location,
      progress: school.progress,
      coordinates: school.coordinates,
      status: school.status,
      facilitator:
        school.assignments.length > 0 ? school.assignments[0].facilitator : null,
    });

    // Jika detail sekolah ditemukan
    if (schoolDetail) {
      const response = {
        id: schoolDetail.id,
        sekolah_id: schoolDetail.sekolah_id,
        ded_path: schoolDetail.ded_path,
        rab_path: schoolDetail.rab_path,
        foto_progress: schoolDetail.foto_progress,
        catatan_masalah: schoolDetail.catatan_masalah,
        rekomendasi: schoolDetail.rekomendasi,
        last_updated: schoolDetail.last_updated,
        school: mapSchool(schoolDetail.School),
      };

      return res.status(200).json({
        success: true,
        data: response,
      });
    }

    // Jika detail tidak ditemukan, ambil data sekolah dasar
    const school = await School.findOne({
      where: { id },
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
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "Sekolah tidak ditemukan",
      });
    }

    // Format respons dengan data dasar sekolah
    const response = {
      id: null,
      sekolah_id: school.id,
      ded_path: null,
      rab_path: null,
      foto_progress: null,
      catatan_masalah: null,
      rekomendasi: null,
      last_updated: null,
      school: mapSchool(school),
    };

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching school detail:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

// Update Recommendations
export const updateRecommendations = async (req, res) => {
  try {
    const { id } = req.params;
    const { recommendations } = req.body;

    const [updated] = await SchoolDetail.update(
      { rekomendasi: recommendations },
      { where: { sekolah_id: id } }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Detail sekolah tidak ditemukan' });
    }

    res.status(200).json({ message: 'Rekomendasi berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Issue
export const addIssue = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, description } = req.body;

    let schoolDetail = await SchoolDetail.findOne({ where: { sekolah_id: id } });

    // Buat issue baru
    const newIssue = {
      id: Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      description,
      resolved: false
    };

    if (!schoolDetail) {
      // Buat baru jika belum ada
      schoolDetail = await SchoolDetail.create({
        sekolah_id: id,
        catatan_masalah: [newIssue]
      });
    } else {
      // Update jika sudah ada
      const issues = schoolDetail.catatan_masalah || [];
      const updatedIssues = [...issues, newIssue];
      await schoolDetail.update({ catatan_masalah: updatedIssues });
    }

    res.status(201).json(newIssue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Add Photo
export const addPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { milestone, caption } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "File foto tidak ditemukan" });
    }

    const schoolDetail = await SchoolDetail.findOne({
      where: { sekolah_id: id },
    });
    
    if (!schoolDetail) {
      return res.status(404).json({ error: "Detail sekolah tidak ditemukan" });
    }

    // Generate URL untuk akses publik
    const publicUrl = generatePublicUrl(req.file.filename);

   const newPhoto = {
      id: (schoolDetail.foto_progress || []).length + 1,
      filename: req.file.filename,
      caption: caption || `Progress ${milestone}%`,
      milestone: parseInt(milestone),
    };

    const updatedPhotos = [...(schoolDetail.foto_progress || []), newPhoto];

    await SchoolDetail.update(
      { foto_progress: updatedPhotos },
      { where: { sekolah_id: id } }
    );

    res.status(201).json({
        newPhoto,
        url: publicUrl,
    });
  } catch (error) {
    console.error("Error adding photo:", error);
    res.status(500).json({ error: error.message });
  }
};

// Fungsi untuk menghapus foto (opsional)
export const deletePhoto = async (req, res) => {
  try {
    const { id, photoId } = req.params;

    const schoolDetail = await SchoolDetail.findOne({
      where: { sekolah_id: id },
    });
    
    if (!schoolDetail) {
      return res.status(404).json({ error: "Detail sekolah tidak ditemukan" });
    }

    const photos = schoolDetail.foto_progress || [];
    const photoIndex = photos.findIndex(photo => photo.id === parseInt(photoId));
    
    if (photoIndex === -1) {
      return res.status(404).json({ error: "Foto tidak ditemukan" });
    }

    const [deletedPhoto] = photos.splice(photoIndex, 1);
    
    // Hapus file fisik dari server
    const filePath = path.join(
      __dirname,
      "../../uploads/school-progress",
      deletedPhoto.filename
    );
    
    fs.unlink(filePath, (err) => {
      if (err) console.error("Gagal menghapus file:", err);
    });

    await SchoolDetail.update(
      { foto_progress: photos },
      { where: { sekolah_id: id } }
    );

    res.status(200).json({ message: "Foto berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting photo:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update Issue Status
export const updateIssueStatus = async (req, res) => {
  try {
    const { id, issueId } = req.params;
    const { resolved } = req.body;

    const schoolDetail = await SchoolDetail.findOne({ where: { sekolah_id: id } });
    if (!schoolDetail) {
      return res.status(404).json({ error: 'Detail sekolah tidak ditemukan' });
    }

    const issues = schoolDetail.catatan_masalah || [];
    const updatedIssues = issues.map(issue => 
      issue.id === parseInt(issueId) ? { ...issue, resolved } : issue
    );

    await schoolDetail.update({ catatan_masalah: updatedIssues });

    res.status(200).json({ 
      message: 'Status masalah berhasil diperbarui',
      issues: updatedIssues
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getGallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const offset = (page - 1) * limit;

    // Query untuk mengambil data sekolah yang memiliki foto progress
    const { count, rows } = await SchoolDetail.findAndCountAll({
      include: [{
        model: School,
        as: 'School',
        attributes: ['id', 'name', 'kabupaten', 'progress']
      }],
      where: {
        foto_progress: {
          [Op.ne]: null // Hanya ambil yang memiliki foto progress
        }
      },
      limit,
      offset,
      order: [['last_updated', 'DESC']]
    });

    // Flatten data untuk memudahkan frontend
    const galleryItems = [];
    
    rows.forEach(detail => {
      if (detail.foto_progress && Array.isArray(detail.foto_progress)) {
        detail.foto_progress.forEach(photo => {
          galleryItems.push({
            id: photo.id,
            schoolId: detail.School.id,
            schoolName: detail.School.name,
            kabupaten: detail.School.kabupaten,
            progress: detail.School.progress,
            caption: photo.caption,
            filename: photo.filename,
            milestone: photo.milestone,
            uploadDate: detail.last_updated
          });
        });
      }
    });

    res.json({
      success: true,
      data: galleryItems,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count
    });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data galeri"
    });
  }
};

export const getGalleryBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const schoolDetail = await SchoolDetail.findOne({
      where: { sekolah_id: schoolId },
      include: [{
        model: School,
        as: 'School',
        attributes: ['id', 'name', 'kabupaten', 'progress']
      }]
    });

    if (!schoolDetail) {
      return res.status(404).json({
        success: false,
        message: "Data sekolah tidak ditemukan"
      });
    }

    const galleryData = {
      schoolId: schoolDetail.School.id,
      schoolName: schoolDetail.School.name,
      kabupaten: schoolDetail.School.kabupaten,
      progress: schoolDetail.School.progress,
      photos: schoolDetail.foto_progress || []
    };

    res.json({
      success: true,
      data: galleryData
    });
  } catch (error) {
    console.error("Error fetching school gallery:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data galeri sekolah"
    });
  }
};