import Role from "../models/role.js";

export const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      attributes: ['id', 'role_name']
    });

    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data role"
    });
  }
};