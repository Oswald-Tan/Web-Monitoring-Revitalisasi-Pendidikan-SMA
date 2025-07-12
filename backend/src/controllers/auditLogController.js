import { Op } from "sequelize";
import AuditLog from "../models/audit_log.js";
import User from "../models/user.js";

// Fungsi untuk mendapatkan semua log audit
export const getAllAuditLogs = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const action = req.query.action || "";
  const entity = req.query.entity || "";
  const offset = page * limit;

  try {
    const whereCondition = {};

    if (search) {
      whereCondition[Op.or] = [
        { action: { [Op.substring]: search } },
        { entity: { [Op.substring]: search } },
        { description: { [Op.substring]: search } },
        { ipAddress: { [Op.substring]: search } },
        { "$user.username$": { [Op.substring]: search } },
      ];
    }

    // Filter action
    if (action) {
      whereCondition.action = action;
    }

    // Filter entity
    if (entity) {
      whereCondition.entity = entity;
    }

    const result = await AuditLog.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
      offset: offset,
      limit: limit,
    });

    const totalRows = result.count;
    const totalPage = Math.ceil(totalRows / limit);

    res.json({
      results: result.rows,
      page: page,
      limit: limit,
      totalRows: totalRows,
      totalPage: totalPage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk mendapatkan log audit berdasarkan ID
export const getAuditLogById = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fungsi untuk menghapus log audit
export const deleteAuditLog = async (req, res) => {
  try {
    const log = await AuditLog.findByPk(req.params.id);
    if (!log) {
      return res.status(404).json({ message: "Audit log not found" });
    }

    await log.destroy();
    
    res.json({ message: "Audit log deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi untuk menghapus beberapa log audit sekaligus
export const deleteMultipleAuditLogs = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid log IDs provided" });
    }

    const result = await AuditLog.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    });

    if (result === 0) {
      return res.status(404).json({ message: "No logs found to delete" });
    }

    res.json({ message: `${result} audit logs deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};