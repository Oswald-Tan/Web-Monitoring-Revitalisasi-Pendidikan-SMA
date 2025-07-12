import User from "../models/user.js";
import { Dosen } from "../models/dosen.js";
import Role from "../models/role.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import DetailsUsers from "../models/details_users.js";
import db from "../config/database.js";
import fs from "fs";

export const addAdminProdi = async (req, res) => {
  const {
    fullname,
    email,
    phone_number,
    password,
    username,
    prodiAdmin,
    role,
    nip,
    jabatan,
    address,
  } = req.body;

  // Ambil file jika ada
  const photo_profile = req.files?.photo_profile;

  // Validasi input
  if (!fullname || !email || !phone_number || !password || !username || !role) {
    return res.status(400).json({
      message: "Field wajib harus diisi",
      success: false,
    });
  }

  // Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Format email tidak valid",
      success: false,
    });
  }

  // Validasi nomor HP
  const phoneRegex = /^(?:\+62|0)[0-9]{8,12}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({
      message: "Format nomor HP tidak valid. Gunakan format 08xxx atau +62xxx",
      success: false,
    });
  }

  try {
    // Cek duplikat data
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({
        message: "Username telah terdaftar",
        success: false,
      });
    }

    const existingEmail = await DetailsUsers.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({
        message: "Email telah terdaftar",
        success: false,
      });
    }

    const existingPhone = await DetailsUsers.findOne({
      where: { phone_number },
    });
    if (existingPhone) {
      return res.status(409).json({
        message: "Nomor HP telah terdaftar",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cari role_id berdasarkan nama role
    const roleRecord = await Role.findOne({ where: { role_name: role } });
    if (!roleRecord) {
      return res.status(400).json({
        message: "Role tidak valid",
        success: false,
      });
    }

    // Buat user baru dengan transaction
    const t = await db.transaction();

    try {
      // 1. Buat user di tabel users
      const user = await User.create(
        {
          username,
          password: hashedPassword,
          role_id: roleRecord.id,
          prodiAdmin: prodiAdmin || null,
          status: "active",
        },
        { transaction: t }
      );

      // Handle file upload
      let photoPath = null;
      if (photo_profile) {
        const ext = path.extname(photo_profile.name);
        const filename = `${user.id}-${Date.now()}${ext}`;
        const savePath = path.join(
          __dirname,
          "../../public/images/profiles",
          filename
        );

        await photo_profile.mv(savePath);
        photoPath = `/images/profiles/${filename}`;
      }

      // 2. Buat detail di tabel details_users
      await DetailsUsers.create(
        {
          user_id: user.id,
          fullname,
          email,
          phone_number,
          nip: nip || null,
          jabatan: jabatan || null,
          address: address || null,
          photo_profile: photoPath,
        },
        { transaction: t }
      );

      // Commit transaction
      await t.commit();

      return res.status(201).json({
        message: "Admin Prodi berhasil ditambahkan",
        success: true,
        userId: user.id,
      });
    } catch (error) {
      // Rollback transaction jika ada error
      await t.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error adding admin prodi:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      success: false,
      error: error.message,
    });
  }
};

export const listAdminProdi = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = limit * page;

  try {
    // Hitung total user berdasarkan pencarian fullname
    const totalUser = await User.count({
      include: {
        model: Role,
        as: "userRole",
        attributes: ["role_name"],
        where: { role_name: "admin" },
        required: true,
      },
      where: search ? { fullname: { [Op.substring]: search } } : {},
    });

    const totalRows = totalUser;
    const totalPage = Math.ceil(totalRows / limit);

    // Ambil data user dengan fullname dari DetailUsers
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
          where: { role_name: "admin" },
          required: true,
        },
      ],
      attributes: ["id", "username", "role_id", "prodiAdmin", "fullname"],
      where: search ? { fullname: { [Op.substring]: search } } : {},
      order: [["fullname", "ASC"]],
      offset: offset,
      limit: limit,
    });

    // Mapping data untuk response
    const data = users.map((user) => ({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      role: user.userRole.role_name,
      prodi: user.prodiAdmin || "-",
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

export const listDetailAdminProdi = async (req, res) => {
  const { id } = req.params;

  try {
    const userDetails = await DetailsUsers.findOne({
      where: { user_id: id },
      include: [
        {
          model: User,
          attributes: [
            "fullname",
            "email",
            "phone_number",
            "username",
            "prodiAdmin",
          ], // hanya username dari User
          as: "user", // gunakan alias yang sudah benar
        },
      ],
    });

    // Jika tidak ada detail pengguna
    if (!userDetails) {
      return res.status(200).json({
        photo_profile: "-",
        nip: "-",
        jabatan: "-",
        address: "-",
        prodi: "-",
      });
    }

    res.status(200).json({
      id: userDetails.user_id,
      email: userDetails.user?.email,
      fullname: userDetails.user?.fullname,
      phone_number: userDetails.user?.phone_number,
      photo_profile: userDetails.photo_profile,
      username: userDetails.user?.username ?? "-",
      nip: userDetails.nip || "-",
      jabatan: userDetails.jabatan || "-",
      address: userDetails.address || "-",
      prodi: userDetails.user?.prodiAdmin || "-",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Edit Admin Prodi
// controller.js
export const editAdminProdi = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Gunakan req.body untuk data text
    const {
      username,
      password,
      confirmPassword,
      role,
      status,
      prodiAdmin,
      fullname,
      email,
      phone_number,
      nip,
      jabatan,
      address,
    } = req.body; // Sekarang req.body sudah terisi

    // Update user data
    if (username && username !== user.username) {
      user.username = username;
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;

    if (password) {
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (role) {
      const roleObj = await Role.findOne({ where: { role_name: role } });
      if (!roleObj) {
        return res.status(400).json({ message: "Invalid role" });
      }
      user.role_id = roleObj.id;
    }

    if (status) user.status = status;
    if (prodiAdmin) user.prodiAdmin = prodiAdmin;

    await user.save();

    // Handle user details
    let userDetails = await DetailsUsers.findOne({
      where: { user_id: user.id },
    });

    if (!userDetails) {
      userDetails = await DetailsUsers.create({ user_id: user.id });
    }

    if (nip) userDetails.nip = nip;
    if (jabatan) userDetails.jabatan = jabatan;
    if (address) userDetails.address = address;

    // Handle file upload
    if (req.file) {
      const fileName = req.file.filename;

      // Hapus file lama jika ada
      if (userDetails.photo_profile) {
        const oldFilePath = path.join(
          __dirname,
          "../public/uploads",
          userDetails.photo_profile
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      userDetails.photo_profile = fileName;
    }

    await userDetails.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserWithDetails = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [
        {
          model: DetailsUsers,
          as: "userDetails",
          attributes: ["nip", "jabatan", "address", "photo_profile"],
        },
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

    // Format response
    const response = {
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        phone_number: user.phone_number,
        username: user.username,
        role: user.userRole ? user.userRole.role_name : null,
        status: user.status,
        prodiAdmin: user.prodiAdmin,
      },
      detail: {
        nip: user.userDetails?.nip,
        jabatan: user.userDetails?.jabatan,
        address: user.userDetails?.address,
        photo_profile: user.userDetails?.photo_profile,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Admin Prodi
export const deleteAdminProdi = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari admin berdasarkan ID
    const admin = await User.findByPk(id);
    if (!admin) {
      return res
        .status(404)
        .json({ message: "Admin Prodi tidak ditemukan", success: false });
    }

    // Hapus admin
    await admin.destroy();

    return res
      .status(200)
      .json({ message: "Admin Prodi berhasil dihapus", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Terjadi kesalahan", success: false });
  }
};

export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = limit * page;

  try {
    // Hitung total user berdasarkan pencarian fullname
    const totalUser = await User.count({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: [],
          where: { role_name: "admin" },
          required: true,
        },
      ],
      where: search
        ? {
            fullname: { [Op.substring]: search },
          }
        : {},
    });

    const totalRows = totalUser;
    const totalPage = Math.ceil(totalRows / limit);

    // Ambil data user dengan fullname dari DetailUsers
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
          where: { role_name: "admin" },
          required: true,
        },
      ],
      attributes: [
        "id",
        "username",
        "role_id",
        "fullname",
        "email",
        "phone_number",
      ],
      where: search
        ? {
            fullname: { [Op.substring]: search },
          }
        : {},
      order: [["fullname", "ASC"]],
      offset: offset,
      limit: limit,
    });

    // Mapping data untuk response
    const data = users.map((user) => ({
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      role: user.userRole.role_name,
      email: user.email,
      phone_number: user.phone_number,
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

// Fungsi untuk mendapatkan detail pengguna berdasarkan ID
export const getUserDetails = async (req, res) => {
  const { id } = req.params;

  try {
    // Cari user utama beserta detailnya
    const user = await User.findByPk(id, {
      include: [
        {
          model: DetailsUsers,
          as: "userDetails", // sesuai dengan alias di model
        },
      ],
    });

    // Jika user tidak ditemukan
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Jika user ditemukan, kita format responsenya
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email, // dari User
      fullname: user.fullname, // dari User
      phone_number: user.phone_number, // dari User
      nip: user.userDetails ? user.userDetails.nip : null,
      jabatan: user.userDetails ? user.userDetails.jabatan : null,
      address: user.userDetails ? user.userDetails.address : null,
      photo_profile: user.userDetails ? user.userDetails.photo_profile : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.id },
      attributes: [
        "id",
        "fullname",
        "email",
        "username",
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
      fullname: user.fullname,
      email: user.email, // Ambil email dari DetailsUsers
      phone_number: user.phone_number,
      username: user.username,
      role: user.userRole.role_name,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { fullname, email, phone_number, password, confirmPassword, roleName } =
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

    // Buat user baru dengan menyertakan fullname dan phone_number
    const newUser = await User.create({
      fullname, // Simpan langsung di User
      email,
      phone_number: phone_number || null, // Jika ada
      password: hashedPassword,
      role_id: role.id,
    });

    // Buat DetailsUsers kosong untuk user ini
    await DetailsUsers.create({
      user_id: newUser.id,
      // Tidak perlu menyertakan fullname, email, phone_number lagi
    });

    res.status(201).json({
      message: "User created successfully",
      data: {
        id: newUser.id,
        fullname: newUser.fullname, // Ambil dari User
        email: newUser.email, // Ambil dari User
        phone_number: newUser.phone_number, // Ambil dari User
        role: role.role_name,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message, errors: error.errors });
  }
};

export const updateUser = async (req, res) => {
  const user = await User.findOne({ where: { id: req.params.id } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const { fullname, email, password, confirmPassword, roleName } = req.body;

  let hashedPassword = user.password;
  if (password) {
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  try {
    const role = await Role.findOne({ where: { role_name: roleName } });
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    // Update User (tanpa username karena tidak dikirim)
    await User.update(
      {
        fullname,
        email,
        password: hashedPassword,
        role_id: role.id,
      },
      { where: { id: user.id } }
    );

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export const getUsersByRole = async (req, res) => {
  try {
  const { role } = req.query;

    if (!role) {
      return res.status(400).json({ 
        message: "Parameter 'role' wajib diisi" 
      });
    }

    const roleData = await Role.findOne({
      where: { role_name: role },
    });

    // ========== PERBAIKAN DI SINI ========== //
    if (!roleData) {
      return res.status(404).json({ 
        message: `Role '${role}' tidak ditemukan` 
      });
    }
    // ======================================= //

    // Dapatkan user berdasarkan role_id
    const users = await User.findAll({
      where: { role_id: roleData.id },
      attributes: ["id", "fullname", "email", "role_id"],
      include: [
        // Jika perlu data tambahan dari model Dosen
        {
          model: Dosen,
          attributes: ["nip", "nidn", "jurusan", "prodi"],
        },
      ],
    });

    // Format data untuk response
    const formattedUsers = users.map((user) => {
      const baseData = {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role: role,
      };

      // Tambahkan data khusus dosen jika ada
      if (user.dosen) {
        return {
          ...baseData,
          nip: user.dosen.nip,
          nidn: user.dosen.nidn,
          jurusan: user.dosen.jurusan,
          prodi: user.dosen.prodi,
        };
      }

      return baseData;
    });

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Controller untuk mendapatkan semua user dengan role tertentu (dosen dan admin_jurusan)
export const getEventParticipants = async (req, res) => {
  try {
    const [dosen, adminJurusan] = await Promise.all([
      getUsersByRoleHelper("dosen"),
      getUsersByRoleHelper("admin"),
    ]);

    res.json([...dosen, ...adminJurusan]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function untuk mendapatkan user by role
async function getUsersByRoleHelper(roleName) {
  const roleData = await Role.findOne({ where: { role_name: roleName } });

  if (!roleData) return [];

  return await User.findAll({
    where: { role_id: roleData.id },
    attributes: ["id", "fullname", "email"],
  });
}
