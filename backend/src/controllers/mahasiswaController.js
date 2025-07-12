import bcrypt from "bcrypt";
import { Mahasiswa, DetailMahasiswa } from "../models/mahasiswa.js";
import { Op } from "sequelize";
import path from "path";
import User from "../models/user.js";
import Role from "../models/role.js";
import db from "../config/database.js";

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateNumberPhone = (phone) => {
  const re = /^(?:\+62|0)[0-9]{8,12}$/;
  return re.test(phone);
};

export const addMahasiswa = async (req, res) => {
  try {
    // Destructure data
    const {
      fullname,
      email,
      phone_number,
      username,
      nim,
      jenisKelamin,
      kotaLahir,
      tglLahir,
      agama,
      alamatTerakhir,
      kota,
      kodePos,
      angkatan,
      noTestMasuk,
      tglTerdaftar,
      statusMasukPt,
      jurusan,
      prodi,
    } = req.body;

    // Validasi input
    if (
      !fullname ||
      !nim ||
      !jenisKelamin ||
      !kotaLahir ||
      !tglLahir ||
      !agama ||
      !jurusan ||
      !prodi
    ) {
      return res
        .status(400)
        .json({ message: "Beberapa field wajib belum diisi!" });
    }

    // Validasi email
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email tidak valid!" });
    }

    // Validasi nomor telepon (gunakan regex yang sama dengan frontend)
    const phoneRegex = /^(?:\+62|0)[0-9]{8,12}$/;
    if (!phoneRegex.test(phone_number)) {
      return res.status(400).json({ message: "Nomor telepon tidak valid!" });
    }

    // Cek duplikasi
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    const existingPhone = await User.findOne({ where: { phone_number } });
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: "Nomor telepon sudah terdaftar!" });
    }

    const existingNim = await Mahasiswa.findOne({ where: { nim } });
    if (existingNim) {
      return res.status(400).json({ message: "NIM sudah terdaftar!" });
    }

    // Hashing password yang benar
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync("12345678", salt);

    // Buat user
    const user = await User.create({
      fullname,
      username: nim, // Gunakan NIM sebagai username
      email,
      phone_number,
      password,
      role_id: 3,
      prodiAdmin: "NotProdi",
      prodiDosen: "NotProdi",
      status: "active",
    });

    // Buat data mahasiswa
    await Mahasiswa.create({
      fullname,
      userId: user.id,
      nim,
      jenisKelamin,
      kotaLahir,
      tglLahir,
      agama,
      alamatTerakhir,
      kota,
      kodePos,
      angkatan,
      noTestMasuk,
      tglTerdaftar,
      statusMasukPt,
      jurusan,
      prodi,
    });

    return res.status(200).json({
      message: "Mahasiswa berhasil ditambahkan!",
      success: true,
    });
  } catch (error) {
    console.error("Error in addMahasiswa:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const getAllMahasiswa = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || ""; // Get the search query
  const offset = limit * page;

  try {
    const totalMahasiswa = await Mahasiswa.count({
      where: {
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nim: { [Op.substring]: search } },
          { prodi: { [Op.substring]: search } },
        ],
      },
    });

    const totalRows = totalMahasiswa;
    const totalPage = Math.ceil(totalRows / limit);

    const dataMahasiswa = await Mahasiswa.findAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nim: { [Op.substring]: search } },
          { prodi: { [Op.substring]: search } },
        ],
      },
      include: [
        {
          model: User,
          attributes: ["username"],
          include: [
            {
              model: Role,
              attributes: ["role_name"],
              as: "userRole",
            },
          ],
        },
      ],
      order: [["fullname", "asc"]],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      result: dataMahasiswa,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const list = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const offset = limit * page;
  const adminProdi = req.query.adminProdi; // Dapatkan dari query params

  // Validasi jika adminProdi tidak ada
  if (!adminProdi) {
    return res.status(400).json({
      message: "Prodi admin tidak ditemukan",
    });
  }

  try {
    const totalMahasiswa = await Mahasiswa.count({
      where: {
        prodi: adminProdi, // Filter berdasarkan prodi admin
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nim: { [Op.substring]: search } },
        ],
      },
    });

    const totalRows = totalMahasiswa;
    const totalPage = Math.ceil(totalRows / limit);

    const dataMahasiswa = await Mahasiswa.findAll({
      where: {
        prodi: adminProdi, // Filter berdasarkan prodi admin
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nim: { [Op.substring]: search } },
        ],
      },
      include: [
        {
          model: User,
          attributes: ["username", "phone_number", "email"],
          include: [
            {
              model: Role,
              attributes: ["role_name"],
              as: "userRole",
            },
          ],
        },
      ],
      order: [["fullname", "asc"]],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      result: dataMahasiswa,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllMahasiswaCount = async (req, res) => {
  try {
    const totalMahasiswa = await Mahasiswa.count();

    res.json({ totalMahasiswa });
  } catch (error) {
    console.error("Error fetching mahasiswa count:", error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

//get jumlah mahasiswa berdasarkan prodi admin
export const getMahasiswaCount = async (req, res) => {
  const prodiAdmin = req.query.prodiAdmin;

  if (!prodiAdmin) {
    return res.status(400).json({ message: "ProdiAdmin tidak diberikan" });
  }

  try {
    console.log("ProdiAdmin:", prodiAdmin);
    const totalMahasiswa = await Mahasiswa.count({
      where: { prodi: prodiAdmin },
    });

    res.json({ totalMahasiswa });
  } catch (error) {
    console.error("Error fetching mahasiswa count:", error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

// Get jumlah mahasiswa tanpa filter prodi
export const getJumlahMahasiswa = async (req, res) => {
  try {
    const totalMahasiswa = await Mahasiswa.count();

    res.json({ totalMahasiswa });
  } catch (error) {
    console.error("Error fetching mahasiswa count:", error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

export const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const dataMahasiswa = await Mahasiswa.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["email", "phone_number"],
        },
        {
          model: DetailMahasiswa,
        },
      ],
    });

    return res.status(200).json({
      result: dataMahasiswa,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMahasiswaWithDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const mahasiswa = await Mahasiswa.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["email"],
        },
        {
          model: DetailMahasiswa,
          attributes: [
            "statusMahasiswa",
            "tahunTamatSmta",
            "jurusanDiSmta",
            "tglIjazahSmta",
            "nilaiUjianAkhirSmta",
            "namaOrtuWali",
            "pendapatanOrtuWali",
            "alamatWali",
            "kotaWali",
            "kodePosWali",
            "noHpWali",
            "emailWali",
          ],
        },
      ],
    });

    if (!mahasiswa) {
      return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    }

    return res.status(200).json({ result: mahasiswa });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const edit = async (req, res) => {
  const mahasiswaId = req.params.id;
  const {
    fullname,
    email,
    phone_number,
    nim,
    jenisKelamin,
    kotaLahir,
    tglLahir,
    agama,
    alamatTerakhir,
    kota,
    kodePos,
    angkatan,
    noTestMasuk,
    tglTerdaftar,
    statusMasukPt,
    jurusan,
    prodi,
  } = req.body;

  // Validasi input
  if (
    !fullname ||
    !nim ||
    !jenisKelamin ||
    !kotaLahir ||
    !tglLahir ||
    !agama ||
    !jurusan ||
    !prodi
  ) {
    return res
      .status(400)
      .json({ message: "Beberapa field wajib belum diisi!" });
  }

  // Validasi email
  if (!validateEmail(email)) {
    return res.status(400).json({ message: "Email tidak valid!" });
  }

  // Validasi nomor telepon (gunakan regex yang sama dengan frontend)
  const phoneRegex = /^(?:\+62|0)[0-9]{8,12}$/;
  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ message: "Nomor telepon tidak valid!" });
  }

  try {
    const mahasiswa = await Mahasiswa.findByPk(mahasiswaId, {
      include: [
        {
          model: User,
        },
      ],
    });

    if (!mahasiswa || !mahasiswa.User) {
      return res.status(404).json({ message: "Mahasiswa tidak ditemukan" });
    }

    await User.update(
      {
        fullname: fullname,
        username: nim,
        email: email,
        phone_number: phone_number,
      },
      {
        where: {
          id: mahasiswa.userId,
        },
      }
    );

    await Mahasiswa.update(
      {
        fullname: fullname,
        email: email,
        phone_number: phone_number,
        nim: nim,
        jenisKelamin: jenisKelamin,
        kotaLahir: kotaLahir,
        tglLahir: tglLahir,
        agama: agama,
        alamatTerakhir: alamatTerakhir,
        kota: kota,
        kodePos: kodePos,
        angkatan: angkatan,
        noTestMasuk: noTestMasuk,
        tglTerdaftar: tglTerdaftar,
        statusMasukPt: statusMasukPt,
        jurusan: jurusan,
        prodi: prodi,
      },
      {
        where: {
          id: mahasiswaId,
        },
      }
    );

    return res.status(200).json({ message: "Data berhasil diubah!" });
  } catch (error) {
    console.error("Edit error:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const addDetail = async (req, res) => {
  const idMahasiswa = req.query.idMahasiswa;

  const statusMahasiswa = req.body.statusMahasiswa;
  const tahunTamatSmta = req.body.tahunTamatSmta;
  const jurusanDiSmta = req.body.jurusanDiSmta;
  const tglIjazahSmta = req.body.tglIjazahSmta;
  const nilaiUjianAkhirSmta = req.body.nilaiUjianAkhirSmta;
  const namaOrtuWali = req.body.namaOrtuWali;
  const pendapatanOrtuWali = req.body.pendapatanOrtuWali;
  const alamatWali = req.body.alamatWali;
  const kotaWali = req.body.kotaWali;
  const kodePosWali = req.body.kodePosWali;
  const noHpWali = req.body.noHpWali;
  const emailWali = req.body.emailWali;

  try {
    const cekDetailMahasiswa = await DetailMahasiswa.count({
      where: { mahasiswaId: idMahasiswa },
    });

    if (cekDetailMahasiswa > 0) {
      // jika data sudah ada, maka update data
      await DetailMahasiswa.update(
        {
          statusMahasiswa: statusMahasiswa,
          tahunTamatSmta: tahunTamatSmta,
          jurusanDiSmta: jurusanDiSmta,
          tglIjazahSmta: tglIjazahSmta,
          nilaiUjianAkhirSmta: nilaiUjianAkhirSmta,
          namaOrtuWali: namaOrtuWali,
          pendapatanOrtuWali: pendapatanOrtuWali,
          alamatWali: alamatWali,
          kotaWali: kotaWali,
          kodePosWali: kodePosWali,
          noHpWali: noHpWali,
          emailWali: emailWali,
        },
        {
          where: { mahasiswaId: idMahasiswa },
        }
      );

      return res
        .status(200)
        .json({ message: "Detail berhasil di ubah", success: true });
    } else {
      // jika data belum ada, maka tambah data
      await DetailMahasiswa.create({
        mahasiswaId: idMahasiswa,
        statusMahasiswa: statusMahasiswa,
        tahunTamatSmta: tahunTamatSmta,
        jurusanDiSmta: jurusanDiSmta,
        tglIjazahSmta: tglIjazahSmta,
        nilaiUjianAkhirSmta: nilaiUjianAkhirSmta,
        namaOrtuWali: namaOrtuWali,
        pendapatanOrtuWali: pendapatanOrtuWali,
        alamatWali: alamatWali,
        kotaWali: kotaWali,
        kodePosWali: kodePosWali,
        noHpWali: noHpWali,
        emailWali: emailWali,
      });

      return res
        .status(200)
        .json({ message: "Detail berhasil ditambahkan", success: true });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const mahasiswa = await Mahasiswa.findByPk(req.params.id);

    // Hapus relasi
    await DetailMahasiswa.destroy({ where: { mahasiswaId: mahasiswa.id } });
    await Mahasiswa.destroy({ where: { id: mahasiswa.id } });

    // Hapus user terkait
    await User.destroy({ where: { id: mahasiswa.userId } });

    return res.status(200).json({ message: "Mahasiswa berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getMahasiswaPerProdi = async (req, res) => {
  try {
    const result = await Mahasiswa.findAll({
      attributes: [
        'prodi',
        [db.fn('COUNT', db.col('id')), 'jumlah'],
      ],
      group: ['prodi'],
      raw: true,
    });

     // Format data untuk Recharts
    const data = result.map(item => ({
      name: item.prodi,
      value: parseInt(item.jumlah)
    }));

    res.json(data);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
