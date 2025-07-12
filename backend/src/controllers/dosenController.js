import { Dosen, DetailDosen } from "../models/dosen.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import Role from "../models/role.js";

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validateNumberPhone = (phone) => {
  const re = /^(?:\+62|0)[0-9]{8,12}$/;
  return re.test(phone);
};

export const addDosen = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone_number,
      nip,
      nidn,
      jenisKelamin,
      tempatLahir,
      tglLahir,
      karpeg,
      cpns,
      pns,
      jurusan,
      prodi,
      pendidikanTerakhir,
      tahun,
      gol,
      tmtGolongan,
      tmtJabatan,
      jabatan,
      agama,
    } = req.body;

    // Validasi input
    // Validasi wajib hanya untuk field yang benar2 wajib
    const requiredFields = [
      "fullname",
      "email",
      "phone_number",
      "nip",
      "nidn",
      "jenisKelamin",
      "jurusan",
      "prodi",
      "agama",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({ message: `${field} harus diisi!` });
      }
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

    const existingNip = await Dosen.findOne({ where: { nip } });
    if (existingNip) {
      return res.status(400).json({ message: "NIP sudah terdaftar!" });
    }

    const existingNidn = await Dosen.findOne({ where: { nidn } });
    if (existingNidn) {
      return res.status(400).json({ message: "NIDN sudah terdaftar!" });
    }

    // Hashing password yang benar
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync("12345678", salt);

    const user = await User.create({
      fullname,
      username: nip,
      email,
      phone_number,
      password,
      role_id: 4,
      prodiAdmin: "NotProdi",
      prodiDosen: prodi,
    });

    const dosen = await Dosen.create({
      fullname,
      userId: user.id,
      nip,
      nidn,
      jenisKelamin,
      tempatLahir,
      tglLahir,
      karpeg,
      cpns,
      pns,
      jurusan,
      prodi,
    });

    await DetailDosen.create({
      dosenId: dosen.id,
      pendidikanTerakhir,
      tahun,
      gol,
      tmtGolongan,
      tmtJabatan,
      jabatan,
      agama,
    });

    return res
      .status(200)
      .json({ message: "Dosen berhasil ditambahkan!", success: true });
  } catch (error) {
    console.error("Error in addDosen:", error);
    return res.status(500).json({
      message: "Terjadi kesalahan server",
      error: error.message,
    });
  }
};

export const edit = async (req, res) => {
  const dosenId = req.params.id;
  const {
    fullname,
    email,
    phone_number,
    nip,
    nidn,
    jenisKelamin,
    tempatLahir,
    tglLahir,
    karpeg,
    cpns,
    pns,
    jurusan,
    prodi,
    pendidikanTerakhir,
    tahun,
    gol,
    tmtGolongan,
    tmtJabatan,
    jabatan,
    agama,
  } = req.body;

  // Validasi input
  if (
    !fullname ||
    !email ||
    !phone_number ||
    !nip ||
    !nidn ||
    !jenisKelamin ||
    !tempatLahir ||
    !tglLahir ||
    !karpeg ||
    !cpns ||
    !pns ||
    !jurusan ||
    !prodi ||
    !pendidikanTerakhir ||
    !tahun ||
    !gol ||
    !tmtGolongan ||
    !tmtJabatan ||
    !jabatan ||
    !agama
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
    const dosen = await Dosen.findByPk(dosenId, {
      include: [
        {
          model: User,
        },
      ],
    });

    if (!dosen || !dosen.User) {
      return res.status(404).json({ message: "Dosen tidak ditemukan" });
    }

    await User.update(
      {
        fullname: fullname,
        email: email,
        phone_number: phone_number,
        prodiAdmin: prodi,
        prodiDosen: prodi,
      },
      {
        where: {
          id: dosen.userId,
        },
      }
    );

    await Dosen.update(
      {
        fullname: fullname,
        nip: nip,
        nidn: nidn,
        jenisKelamin: jenisKelamin,
        tempatLahir: tempatLahir,
        tglLahir: tglLahir,
        karpeg: karpeg,
        cpns: cpns,
        pns: pns,
        jurusan: jurusan,
        prodi: prodi,
      },
      {
        where: {
          id: dosenId,
        },
      }
    );

    await DetailDosen.update(
      {
        pendidikanTerakhir: pendidikanTerakhir,
        tahun: tahun,
        gol: gol,
        tmtGolongan: tmtGolongan,
        tmtJabatan: tmtJabatan,
        jabatan: jabatan,
        agama: agama,
      },
      {
        where: {
          dosenId: dosenId,
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
    const totalDosen = await Dosen.count({
      where: {
        prodi: adminProdi, // Filter berdasarkan prodi admin
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nip: { [Op.substring]: search } },
        ],
      },
    });

    const totalRows = totalDosen;
    const totalPage = Math.ceil(totalRows / limit);

    const dataDosen = await Dosen.findAll({
      where: {
        prodi: adminProdi, // Filter berdasarkan prodi admin
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nip: { [Op.substring]: search } },
        ],
      },
      include: [
        {
          model: User,
          attributes: ["fullname", "username", "phone_number", "email"],
          include: [
            {
              model: Role,
              attributes: ["role_name"],
              as: "userRole",
            },
          ],
        },
        {
          model: DetailDosen,
          as: "detailDosen"
        },
      ],
      order: [["fullname", "asc"]],
      offset: offset,
      limit: limit,
    });

    return res.status(200).json({
      result: dataDosen,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getById = async (req, res) => {
  const id = req.params.id;

  try {
    const dataDosen = await Dosen.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["fullname", "username", "email", "phone_number"],
        },
        {
          model: DetailDosen,
          as: "detailDosen"
        },
      ],
    });

    return res.status(200).json({
      result: dataDosen,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const dosen = await Dosen.findByPk(req.params.id);

    // Hapus relasi
    await DetailDosen.destroy({ where: { dosenId: dosen.id } });
    await Dosen.destroy({ where: { id: dosen.id } });

    // Hapus user terkait
    await User.destroy({ where: { id: dosen.userId } });

    return res.status(200).json({ message: "Dosen berhasil dihapus" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllDosenCount = async (req, res) => {
  try {
    const totalDosen = await Dosen.count();

    res.json({ totalDosen });
  } catch (error) {
    console.error("Error fetching dosen count:", error.message); // Debugging log
    res.status(500).json({ message: error.message });
  }
};

export const getAllDosen = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || ""; // Get the search query
  const offset = limit * page;

  try {
    const totalDosen = await Dosen.count({
      where: {
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nip: { [Op.substring]: search } },
          { prodi: { [Op.substring]: search } },
        ],
      },
    });

    const totalRows = totalDosen;
    const totalPage = Math.ceil(totalRows / limit);

    const dataDosen = await Dosen.findAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.substring]: search } },
          { nip: { [Op.substring]: search } },
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
      result: dataDosen,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const listAll = async (req, res) => {
  try {
    const result = await Dosen.findAll();
    return res.status(200).json({ result: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getDosenWithDetails = async (req, res) => {
  const id = req.params.id;

  try {
    const dosen = await Dosen.findOne({
      where: { id: id },
      include: [
        {
          model: User,
          attributes: ["email"],
        },
        {
          model: DetailDosen,
        },
      ],
    });

    if (!dosen) {
      return res.status(404).json({ message: "Dosen tidak ditemukan" });
    }

    return res.status(200).json({ result: dosen });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};