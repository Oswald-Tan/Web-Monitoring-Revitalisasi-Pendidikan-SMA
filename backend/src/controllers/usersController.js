import User from "../models/user.js";
import Role from "../models/role.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

// Add User Controller
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Add User Controller
export const addUser = async (req, res) => {
  const { name, email, phoneNumber, password, confirmPassword, roleName } =
    req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Cek apakah email sudah digunakan
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    // Cari role berdasarkan roleName
    const role = await Role.findOne({ where: { role_name: roleName } });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name, 
      email,
      phone_number: phoneNumber,
      password: hashedPassword,
      role_id: role.id,
    });


    res.status(201).json({
      message: "User created successfully",
      data: {
        id: newUser.id,
        name: newUser.name, 
        email: newUser.email,
        phoneNumber: newUser.phone_number,
        role: role.role_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, errors: error.errors });
  }
};

export const updateUser = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { name, email, phoneNumber, password, confirmPassword, roleName } = req.body;
  let hashedPassword;
  if (!password) {
    hashedPassword = user.password;
  } else {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  try {
    // Cari role berdasarkan roleName
    const role = await Role.findOne({ where: { role_name: roleName } });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update data User
    await User.update(
      {
        name,
        email,
        phone_number: phoneNumber,
        password: hashedPassword,
        role_id: role.id,
      },
      {
        where: { id: user.id },
      }
    );


    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 5;
  const search = req.query.search || "";
  const offset = limit * page;

  try {
    // Hitung total user berdasarkan pencarian name
    const totalUser = await User.count({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: [],
          required: true,
          // Add where condition to exclude super_admin
          where: {
            role_name: {
              [Op.ne]: "super_admin" // Exclude super_admin role
            }
          }
        },
      ],
      where: search
        ? {
            name: { [Op.substring]: search },
          }
        : {},
    });

    const totalRows = totalUser;
    const totalPage = Math.ceil(totalRows / limit);

    // Ambil data user dengan name dari DetailUsers
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
          required: true,
          // Add where condition to exclude super_admin
          where: {
            role_name: {
              [Op.ne]: "super_admin" // Exclude super_admin role
            }
          }
        },
      ],
      attributes: [
        "id",
        "name",
        "role_id",
        "email",
        "phone_number"
      ],
      where: search
        ? {
            name: { [Op.substring]: search },
          }
        : {},
      order: [["name", "ASC"]],
      offset: offset,
      limit: limit,
    });

    // Mapping data untuk response
    const data = users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.userRole.role_name,
      email: user.email,
      phone_number: user.phone_number
    }));

    res.status(200).json({
      data,
      page,
      limit,
      totalPage,
      totalRows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Di controller users
export const getUsersPersonnel = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["id", "role_name"],
          where: {
            role_name: {
              [Op.notIn]: ["super_admin", "admin_pusat"]
            }
          }
        }
      ]
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data user"
    });
  }
};

//get total users
export const getTotalUsers = async (req, res) => {
  try {
    const totalUser = await User.count({
      where: { role_id: 2 },
    });
    res.status(200).json({ totalUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: [
        "id",
        "name",
        "email",
        "phone_number",
        "role_id",
      ],
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number, 
      role: user.userRole.role_name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getFacilitators = async (req, res) => {
  try {
    const facilitators = await User.findAll({
      where: { role_id: 4, status: "active" },
      attributes: ["id", "name"], 
    });

    res.status(200).json({
      message: "Daftar fasilitator berhasil diambil",
      data: facilitators,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil fasilitator", error: error.message });
  }
};


export const deleteUser = async (req, res) => {
  const user = await User.findOne({
    where: { id: req.params.id },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const deletedUser = await User.destroy({
      where: { id: user.id },
    });

    res.status(200).json({ message: "User deleted", data: deletedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

