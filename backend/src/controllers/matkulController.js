import Matkul from "../models/matkul.js";

export const createMatkul = async (req, res) => {
  const { mata_kuliah, prodi, kode_matkul, sks } = req.body;
  try {
    // validasi tidak boleh kosong
    if (!mata_kuliah || !kode_matkul || !sks) {
      return res.status(400).json({ error: "Data tidak boleh kosong" });
    }

    const cekKodeMatkul = await Matkul.findOne({
      where: { kode_matkul: kode_matkul },
    });

    if (cekKodeMatkul) {
      return res.status(400).json({ error: "Kode matkul sudah ada" });
    }

     await Matkul.create({
      mata_kuliah,
      prodi,
      kode_matkul,
      sks,
    });

    return res.status(201).json({ message: "Matkul berhasil ditambahkan" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllMatkul = async (req, res) => {
  const prodi = req.query.prodi;

  console.log(prodi);

  try {
    const result = await Matkul.findAll({
      where: { prodi: prodi },
    });

    return res.status(200).json({ result: result });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  const id = req.params.id;

  try {
    await Matkul.destroy({ where: { id: id } });

    return res
      .status(200)
      .json({ message: "Data berhasil dihapus", success: true });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getTotal = async (req, res) => {
  const prodi = req.params.prodi;

  try {
    const result = await Matkul.count({ where: { prodi: prodi } });

    return res.status(200).json({ totalMatkul: result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};