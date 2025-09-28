import Personnel from "../models/personnel.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import { Op } from "sequelize";

// Get all personnel with user data
export const getPersonnel = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", role } = req.query;
    const offset = (page - 1) * limit;

    // Build where clause for search
    let whereClause = {};
    if (search) {
      whereClause = {
        [Op.or]: [
          { qualifications: { [Op.like]: `%${search}%` } },
          { certifications: { [Op.like]: `%${search}%` } },
          { zone: { [Op.like]: `%${search}%` } },
        ],
      };
    }

    // Build include clause for User and Role
    const userInclude = {
      model: User,
      attributes: ["id", "name", "email", "phone_number", "status"],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["id", "role_name"],
          where: {
            role_name: {
              [Op.notIn]: ["super_admin", "admin_pusat"],
            },
          },
        },
      ],
    };

    // If role filter is provided, add role condition to user include
    if (role) {
      userInclude.where = { role_id: role };
      userInclude.include = [
        {
          model: Role,
          as: "userRole",
          attributes: ["id", "role_name"],
        },
      ];
    } else {
      userInclude.include = [
        {
          model: Role,
          as: "userRole",
          attributes: ["id", "role_name"],
        },
      ];
    }

    const { count, rows } = await Personnel.findAndCountAll({
      where: whereClause,
      include: [userInclude],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Format the response to use role_name as name
    const formattedRows = rows.map((row) => {
      const user = row.User;
      if (user && user.Role) {
        user.Role.role_name = user.Role.role_name;
      }
      return row;
    });

    res.json({
      success: true,
      data: formattedRows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching personnel:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data personel",
    });
  }
};

// Get personnel by ID
export const getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    const personnel = await Personnel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone_number", "status"],
          include: [
            {
              model: Role,
              as: "userRole",
              attributes: ["id", "role_name"],
            },
          ],
        },
      ],
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        error: "Personel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: personnel,
    });
  } catch (error) {
    console.error("Error fetching personnel:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data personel",
    });
  }
};

// Create personnel profile
export const createPersonnel = async (req, res) => {
  try {
    const {
      user_id,
      qualifications,
      certifications,
      zone,
      assigned_schools,
      cv_path,
      additional_info,
    } = req.body;

    // Check if user exists
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User tidak ditemukan",
      });
    }

    // Check if personnel profile already exists for this user
    const existingPersonnel = await Personnel.findOne({ where: { user_id } });
    if (existingPersonnel) {
      return res.status(400).json({
        success: false,
        error: "Profil personel sudah ada untuk user ini",
      });
    }

    const personnel = await Personnel.create({
      user_id,
      qualifications,
      certifications,
      zone,
      assigned_schools,
      cv_path,
      additional_info,
    });

    // Get the created personnel with user data
    const newPersonnel = await Personnel.findByPk(personnel.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone_number", "status"],
          include: [
            {
              model: Role,
              as: "userRole",
              attributes: ["id", "role_name"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Profil personel berhasil dibuat",
      data: newPersonnel,
    });
  } catch (error) {
    console.error("Error creating personnel:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat profil personel",
    });
  }
};

// Update personnel
export const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      qualifications,
      certifications,
      zone,
      assigned_schools,
      cv_path,
      additional_info,
    } = req.body;

    const personnel = await Personnel.findByPk(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        error: "Personel tidak ditemukan",
      });
    }

    // Update fields
    if (qualifications !== undefined) personnel.qualifications = qualifications;
    if (certifications !== undefined) personnel.certifications = certifications;
    if (zone !== undefined) personnel.zone = zone;
    if (assigned_schools !== undefined)
      personnel.assigned_schools = assigned_schools;
    if (cv_path !== undefined) personnel.cv_path = cv_path;
    if (additional_info !== undefined)
      personnel.additional_info = additional_info;

    await personnel.save();

    // Get the updated personnel with user data
    const updatedPersonnel = await Personnel.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone_number", "status"],
          include: [
            {
              model: Role,
              as: "userRole",
              attributes: ["id", "role_name"],
            },
          ],
        },
      ],
    });

    res.json({
      success: true,
      message: "Data personel berhasil diperbarui",
      data: updatedPersonnel,
    });
  } catch (error) {
    console.error("Error updating personnel:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui data personel",
    });
  }
};

// Delete personnel
export const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const personnel = await Personnel.findByPk(id);
    if (!personnel) {
      return res.status(404).json({
        success: false,
        error: "Personel tidak ditemukan",
      });
    }

    await personnel.destroy();

    res.json({
      success: true,
      message: "Personel berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting personnel:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus personel",
    });
  }
};

// Get personnel by user ID
export const getPersonnelByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const personnel = await Personnel.findOne({
      where: { user_id: userId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "phone_number", "status"],
          include: [
            {
              model: Role,
              as: "userRole",
              attributes: ["id", "role_name"],
            },
          ],
        },
      ],
    });

    if (!personnel) {
      return res.status(404).json({
        success: false,
        error: "Profil personel tidak ditemukan untuk user ini",
      });
    }

    res.json({
      success: true,
      data: personnel,
    });
  } catch (error) {
    console.error("Error fetching personnel by user ID:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data personel",
    });
  }
};
