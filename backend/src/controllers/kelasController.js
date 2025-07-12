import Kelas from "../models/kelas.js";

export const addKelas = async (req, res) => {
  try {
    const { nama_kelas, prodi } = req.body;

    //validasi tidak boleh kosong
    if (!nama_kelas) {
      return res.status(400).json({ error: "Kelas harus diisi" });
    }

    const kelas = await Kelas.create({
      nama_kelas,
      prodi,
      tgl_create: new Date(),
    });

    res.status(201).json({
      message: "Kelas berhasil ditambahkan",
      data: kelas,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllKelas = async (req, res) => {
  const prodi = req.query.prodi;

  // Validate prodi parameter
  if (!prodi) {
    return res.status(400).json({
      message: "Prodi parameter is required",
    });
  }

  console.log(prodi);

  try {
    const dataKelas = await Kelas.findAll({
      where: { prodi: prodi },
    });

    return res.status(200).json({ result: dataKelas });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getByName = async (req, res) => {
  const nama_kelas = req.params.nama_kelas;

  try {
    const dataKelas = await Kelas.findAll({
      where: { nama_kelas: nama_kelas },
    });

    return res.status(200).json({ result: dataKelas });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  const id = req.params.id;

  try {
    await Kelas.destroy({
      where: {
        id: id,
      },
    });

    return res
      .status(200)
      .json({ message: "Kelas berhasil dihapus", success: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
