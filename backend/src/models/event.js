  import { DataTypes } from "sequelize";
  import db from "../config/database.js";

  const Event = db.define(
    "Event",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      start: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      organizer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      type: {
        type: DataTypes.ENUM("Event", "Meeting", "Workshop"),
        defaultValue: "Event",
      },
      status: {
        type: DataTypes.ENUM("upcoming", "ongoing", "completed"),
        defaultValue: "upcoming",
        allowNull: false,
      },
    },
    {
      tableName: "events",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",

      // Tambahkan hook untuk update otomatis status
      hooks: {
        beforeSave: async (event) => {
          const now = new Date();

          if (event.end < now) {
            event.status = "completed";
          } else if (event.start <= now && event.end >= now) {
            event.status = "ongoing";
          } else {
            event.status = "upcoming";
          }
        },
      },
    }
  );

  // Method untuk update status secara batch
  // Method untuk update status secara batch (hanya update event yang belum completed)
Event.updateStatuses = async () => {
  const now = new Date();

  // 1. Update ke completed HANYA untuk event yang ongoing dan sudah melewati end time
  await Event.update(
    { status: "completed" },
    { 
      where: { 
        end: { [db.Sequelize.Op.lt]: now },
        status: "ongoing" // Hanya update dari ongoing ke completed
      } 
    }
  );

  // 2. Update ke ongoing untuk event yang masuk dalam jadwal
  await Event.update(
    { status: "ongoing" },
    {
      where: {
        start: { [db.Sequelize.Op.lte]: now },
        end: { [db.Sequelize.Op.gte]: now },
        status: { [db.Sequelize.Op.not]: "completed" }
      }
    }
  );

  // 3. Update ke upcoming untuk event yang belum dimulai
  await Event.update(
    { status: "upcoming" },
    { 
      where: { 
        start: { [db.Sequelize.Op.gt]: now },
        status: { [db.Sequelize.Op.not]: "completed" }
      }
    }
  );

  // 4. Handle event yang melewati end time tapi belum pernah ongoing
  // (Misal: event upcoming dengan end time yang sudah lewat)
  await Event.update(
    { status: "completed" },
    { 
      where: { 
        end: { [db.Sequelize.Op.lt]: now },
        status: "upcoming"
      } 
    }
  );
};

  export default Event;
