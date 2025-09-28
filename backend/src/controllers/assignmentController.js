import Assignment from "../models/assignment.js";
import User from "../models/user.js";
import School from "../models/school.js";
import db from "../config/database.js";

// Get all assignable users by role
export const getAssignableUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const whereCondition = {
      status: "active",
    };

    if (role) {
      whereCondition.role_id = parseInt(role);
    }

    const users = await User.findAll({
      where: whereCondition,
      attributes: [
        "id",
        "name",
        "email",
        "role_id",
        [
          db.literal(`(
            SELECT COUNT(*)
            FROM assignments
            WHERE assignments.facilitator_id = User.id
            AND assignments.status = 'active'
          )`),
          "current_assignments"
        ],
        [
          db.literal(`(
            SELECT name 
            FROM schools 
            WHERE schools.admin_id = User.id
            LIMIT 1
          )`),
          "assignedSchool"
        ]
      ],
    });

    const formattedUsers = users.map((user) => {
      const maxAssignments = user.role_id === 4 ? 8 : 1;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        current: user.dataValues.current_assignments || 0,
        max: maxAssignments,
        assignedSchool: user.dataValues.assignedSchool || null
      };
    });

    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error("Error fetching assignable users:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data user yang dapat ditugaskan",
    });
  }
};

// Get all schools with their current assignments
export const getSchoolsWithAssignments = async (req, res) => {
  try {
    const schools = await School.findAll({
      attributes: ["id", "name", "location", "kabupaten", "admin_id"],
      include: [
        {
          model: Assignment,
          as: "assignments",
          where: {
            status: "active",
          },
          required: false,
          attributes: ["id", "facilitator_id"],
          include: [
            {
              model: User,
              as: "facilitator",
              attributes: ["id", "name"],
            },
          ],
        },
        {
          model: User,
          as: "Admin",
          attributes: ["id", "name", "email"],
          required: false,
        },
      ],
    });

    // Format the response
    const formattedSchools = schools.map((school) => {
      const currentFacilitator =
        school.assignments.length > 0 ? school.assignments[0].facilitator : null;

      return {
        id: school.id,
        name: school.name,
        location: school.location,
        kabupaten: school.kabupaten,
        facilitator: currentFacilitator
          ? {
              id: currentFacilitator.id,
              name: currentFacilitator.name,
            }
          : null,
        admin: school.Admin ? {
          id: school.Admin.id,
          name: school.Admin.name,
          email: school.Admin.email,
        } : null,
      };
    });

    res.json({
      success: true,
      data: formattedSchools,
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data sekolah",
    });
  }
};

// Bulk assign facilitators
export const bulkAssignFacilitators = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const { assignments } = req.body;
    const assignedBy = req.userId;

    // Reset semua assignment fasilitator
    await Assignment.update(
      { status: "inactive" },
      { where: { status: "active" }, transaction }
    );

    // Buat assignment baru
    const newAssignments = [];
    for (const assignment of assignments) {
      if (assignment.userId) {
        const newAssignment = await Assignment.create({
          facilitator_id: assignment.userId,
          school_id: assignment.schoolId,
          assigned_by: assignedBy,
          status: "active",
        }, { transaction });
        newAssignments.push(newAssignment);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "Penugasan fasilitator berhasil disimpan",
      data: newAssignments,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving facilitator assignments:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menyimpan pembagian tugas fasilitator",
    });
  }
};

// Bulk assign admins
export const bulkAssignAdmins = async (req, res) => {
  const transaction = await db.transaction();
  
  try {
    const { assignments } = req.body;

    // Validasi: Cek duplikasi admin
    const adminAssignments = {};
    const duplicateAdmins = [];

    for (const assignment of assignments) {
      if (assignment.adminId) {
        if (adminAssignments[assignment.adminId]) {
          duplicateAdmins.push(assignment.adminId);
        } else {
          adminAssignments[assignment.adminId] = true;
        }
      }
    }

    if (duplicateAdmins.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Beberapa admin ditugaskan ke multiple sekolah",
        duplicateAdmins
      });
    }

    // Reset semua admin sekolah sebelumnya
    await School.update(
      { admin_id: null },
      { where: {}, transaction }
    );

    // Update semua user yang sebelumnya admin menjadi fasilitator
    await User.update(
      { role_id: 4 },
      { 
        where: { role_id: 5 },
        transaction
      }
    );

    // Update admin untuk setiap sekolah
    for (const assignment of assignments) {
      if (assignment.adminId) {
        await School.update(
          { admin_id: assignment.adminId },
          { where: { id: assignment.schoolId }, transaction }
        );

        // Update role user menjadi admin sekolah
        await User.update(
          { role_id: 5 },
          { where: { id: assignment.adminId }, transaction }
        );
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: "Penugasan admin sekolah berhasil disimpan",
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Error saving admin assignments:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menyimpan pembagian admin sekolah",
    });
  }
};

// Get school admins
export const getSchoolAdmins = async (req, res) => {
  try {
    const admins = await User.findAll({
      where: {
        role_id: 5,
        status: "active",
      },
      attributes: ["id", "name", "email"],
      include: [
        {
          model: School,
          as: "AdminSchools",
          attributes: ["id", "name"],
          required: false,
        },
      ],
    });

    res.json({
      success: true,
      data: admins,
    });
  } catch (error) {
    console.error("Error fetching school admins:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data admin sekolah",
    });
  }
};

export default {
  getAssignableUsers,
  getSchoolsWithAssignments,
  bulkAssignFacilitators,
  bulkAssignAdmins,
  getSchoolAdmins
};