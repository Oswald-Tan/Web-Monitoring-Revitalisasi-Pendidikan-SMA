import { DataTypes } from "sequelize";
import db from "../config/database.js";
import User from "./user.js";

const Dosen = db.define(
  "Dosen",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }, // Wajib
    nip: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    nidn: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    jenisKelamin: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    tempatLahir: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Opsional
    tglLahir: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Opsional
    karpeg: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Opsional
    cpns: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // Opsional
    pns: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // Opsional
    jurusan: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    prodi: {
      type: DataTypes.STRING,
      allowNull: false,
    }, // Wajib
    foto: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // Opsional
    asKaprodi: {
      type: DataTypes.STRING,
      allowNull: true,
    }, // Opsional
  },
  {
    timestamps: false,
    tableName: "dosens",
    freezeTableName: true,
  }
);

const DetailDosen = db.define(
  "detaildosen",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    dosenId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pendidikanTerakhir: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tahun: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tmtGolongan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tmtJabatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    jabatan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    agama: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    freezeTableName: true,
    tableName: "detail_dosens",
    timestamps: false,
  }
);

User.hasMany(Dosen, { foreignKey: 'userId' });
Dosen.belongsTo(User, { foreignKey: 'userId' });

Dosen.hasMany(DetailDosen, { foreignKey: 'dosenId', as: 'detailDosen' });
DetailDosen.belongsTo(Dosen, { foreignKey: 'dosenId', as: 'dosen' });

export { Dosen, DetailDosen };
