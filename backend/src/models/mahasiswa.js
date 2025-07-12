import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Mahasiswa = db.define(
  "Mahasiswa",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Wajib
    userId: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    }, // Wajib
    nim: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Wajib
    jenisKelamin: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Wajib
    kotaLahir: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Opsional
    tglLahir: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Opsional
    agama: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Opsional
    alamatTerakhir: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    kota: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    kodePos: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    angkatan: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    noTestMasuk: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    tglTerdaftar: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    statusMasukPt: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
    jurusan: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Opsional
    prodi: { 
        type: DataTypes.STRING, 
        allowNull: false 
    }, // Opsional
    foto: { 
        type: DataTypes.STRING, 
        allowNull: true 
    }, // Opsional
  },
  {
    timestamps: false,
    tableName: "mahasiswas",
    freezeTableName: true,
  }
);

const DetailMahasiswa = db.define(
  "detailmahasiswa",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    mahasiswaId: { 
        type: DataTypes.INTEGER 
    },
    statusMahasiswa: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    tahunTamatSmta: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    jurusanDiSmta: { 
        type: DataTypes.STRING 
    },
    tglIjazahSmta: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    nilaiUjianAkhirSmta: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    namaOrtuWali: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    pendapatanOrtuWali: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    alamatWali: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    kotaWali: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    kodePosWali: { 
        type: DataTypes.STRING, 
        allowNull: true 
    },
    noHpWali: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
    emailWali: { 
        type: DataTypes.STRING, 
        allowNull: false 
    },
  },
  {
    freezeTableName: true,
    tableName: "detail_mahasiswas",
    timestamps: false,
  }
);

User.hasMany(Mahasiswa);
Mahasiswa.belongsTo(User);

Mahasiswa.hasMany(DetailMahasiswa);
DetailMahasiswa.belongsTo(Mahasiswa)

export { Mahasiswa, DetailMahasiswa };
