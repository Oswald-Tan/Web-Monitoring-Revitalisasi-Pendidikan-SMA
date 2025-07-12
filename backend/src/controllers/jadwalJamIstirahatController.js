import JadwalJamIstirahat from "../models/jadwal_jam_istirahat.js";

export const addJamIstirahat = async (req, res) => {
  const { jamMulaiIstirahat, jamSelesaiIstirahat } = req.body;
  const prodi = req.body.prodi;

  try {
    const existingJamIstirahat = await JadwalJamIstirahat.findOne();

    if (existingJamIstirahat) {
      return res.status(400).json({ message: "Jam istirahat sudah ada" });
    }

    await JadwalJamIstirahat.create({
      prodi,
      jamMulaiIstirahat,
      jamSelesaiIstirahat,
    });

    res.status(200).json({ message: "Jam istirahat berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getJamIstirahat = async (req, res) => {
  const prodi = req.query.prodi;

  try {
    const jamIstirahat = await JadwalJamIstirahat.findAll({
      where: { prodi: prodi },
    });
    return res.status(200).json(jamIstirahat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  const id = req.params.id;

  try {
    await JadwalJamIstirahat.destroy({
      where: {
        id: id,
      },
    });

    return res
      .status(201)
      .json({ message: "Jam Istirahat berhasil dihapus", success: false });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
