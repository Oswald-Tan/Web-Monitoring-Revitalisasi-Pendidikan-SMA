import DiscussionThread from "../models/discussion_thread.js";
import DiscussionMessage from "../models/discussion_message.js";
import School from "../models/school.js";
import User from "../models/user.js";
import db from "../config/database.js";
import { Op } from "sequelize";

export const getThreads = async (req, res) => {
  try {
    const { schoolId, page = 1, limit = 10, search } = req.query;
    let whereClause = {};
    
    if (schoolId) whereClause.schoolId = schoolId;
    if (search) whereClause.title = { [Op.like]: `%${search}%` };

    const offset = (page - 1) * limit;

    const threads = await DiscussionThread.findAll({
      where: whereClause,
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"]
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [
        ["isPinned", "DESC"],
        ["updatedAt", "DESC"]
      ],
      limit: parseInt(limit),
      offset: offset,
    });

    // Get message counts
    const threadIds = threads.map(thread => thread.id);
    
    const messageCounts = await DiscussionMessage.findAll({
      attributes: [
        'threadId',
        [db.fn('COUNT', db.col('id')), 'messageCount'],
        [db.fn('MAX', db.col('createdAt')), 'lastMessageTime']
      ],
      where: {
        threadId: threadIds
      },
      group: ['threadId'],
      raw: true
    });

    // Get last messages using a different approach
    const lastMessages = [];
    for (const mc of messageCounts) {
      const lastMessage = await DiscussionMessage.findOne({
        where: { threadId: mc.threadId },
        order: [['createdAt', 'DESC']],
        include: [{
          model: User,
          as: 'author',
          attributes: ['name']
        }]
      });
      
      if (lastMessage) {
        lastMessages.push({
          threadId: mc.threadId,
          author: lastMessage.author
        });
      }
    }

    const threadsWithCounts = threads.map(thread => {
      const messageCount = messageCounts.find(mc => mc.threadId === thread.id);
      const lastMessage = lastMessages.find(lm => lm.threadId === thread.id);
      
      return {
        ...thread.toJSON(),
        messageCount: messageCount?.messageCount || 0,
        lastUpdate: messageCount?.lastMessageTime || thread.updatedAt,
        lastMessage: lastMessage ? {
          author: lastMessage.author
        } : null
      };
    });

    const totalCount = await DiscussionThread.count({ where: whereClause });

    res.json({
      success: true,
      data: threadsWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error getting discussion threads:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data thread diskusi",
    });
  }
};

// Get single thread with messages
export const getThread = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const offset = (page - 1) * limit;

    const thread = await DiscussionThread.findByPk(id, {
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"]
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"]
        }
      ]
    });

    if (!thread) {
      return res.status(404).json({
        success: false,
        error: "Thread tidak ditemukan",
      });
    }

    // Dapatkan pesan utama (tanpa parent)
    const { count, rows: messages } = await DiscussionMessage.findAndCountAll({
      where: { 
        threadId: id, 
        parentId: null 
      },
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["createdAt", "ASC"]],
      limit: parseInt(limit),
      offset: offset,
    });

    // Untuk setiap pesan utama, dapatkan balasannya
    const messagesWithReplies = await Promise.all(
      messages.map(async (message) => {
        const replies = await DiscussionMessage.findAll({
          where: { parentId: message.id },
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "name", "email"]
            }
          ],
          order: [["createdAt", "ASC"]]
        });
        
        return {
          ...message.toJSON(),
          replies
        };
      })
    );

    // Update view count
    await thread.increment('viewCount');

    res.json({
      success: true,
      data: {
        thread,
        messages: messagesWithReplies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting discussion thread:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengambil data thread",
    });
  }
};

// Create new thread
export const createThread = async (req, res) => {
  try {
    const { title, schoolId, message } = req.body;
    const userId = req.userId;

    if (!title || !schoolId || !message) {
      return res.status(400).json({
        success: false,
        error: "Judul, sekolah, dan pesan pertama harus diisi",
      });
    }

    const thread = await DiscussionThread.create({
      title,
      schoolId,
      createdBy: userId
    });

    // Create first message
    await DiscussionMessage.create({
      threadId: thread.id,
      userId,
      message
    });

    // Get the created thread with associations
    const newThread = await DiscussionThread.findByPk(thread.id, {
      include: [
        {
          model: School,
          attributes: ["id", "name", "kabupaten"]
        },
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: "Thread berhasil dibuat",
      data: newThread
    });
  } catch (error) {
    console.error("Error creating discussion thread:", error);
    res.status(500).json({
      success: false,
      error: "Gagal membuat thread diskusi",
    });
  }
};

// Add message to thread
export const addMessage = async (req, res) => {
  try {
    const { id } = req.params; // Ini adalah threadId
    const { message, parentId } = req.body;
    const userId = req.userId;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Pesan tidak boleh kosong",
      });
    }

    // Check if thread exists - gunakan id dari params
    const thread = await DiscussionThread.findByPk(id); // Ganti threadId dengan id
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: "Thread tidak ditemukan",
      });
    }

    if (thread.isClosed) {
      return res.status(400).json({
        success: false,
        error: "Thread ini sudah ditutup untuk diskusi",
      });
    }

    // Check if parent message exists if replying
    if (parentId) {
      const parentMessage = await DiscussionMessage.findByPk(parentId);
      if (!parentMessage || parentMessage.threadId !== parseInt(id)) { // Ganti threadId dengan id
        return res.status(404).json({
          success: false,
          error: "Pesan yang dibalas tidak ditemukan",
        });
      }
    }

    const newMessage = await DiscussionMessage.create({
      threadId: id, // Gunakan id di sini
      userId,
      message,
      parentId: parentId || null
    });

    // Update thread's updatedAt timestamp
    await thread.update({ updatedAt: new Date() });

    // Get the created message with author info
    const messageWithAuthor = await DiscussionMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: "author",
          attributes: ["id", "name", "email"]
        },
        {
          model: DiscussionMessage,
          as: "parent",
          include: [{
            model: User,
            as: "author",
            attributes: ["name"]
          }]
        }
      ]
    });

    // Emit socket event untuk real-time update
    const io = req.app.get("io");
    io.to(`thread_${id}`).emit("receive_message", messageWithAuthor.toJSON());

    res.status(201).json({
      success: true,
      message: "Pesan berhasil dikirim",
      data: messageWithAuthor
    });
  } catch (error) {
    console.error("Error adding message to thread:", error);
    res.status(500).json({
      success: false,
      error: "Gagal mengirim pesan",
    });
  }
};

// Update thread status (pin/close)
export const updateThreadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPinned, isClosed } = req.body;
    const userId = req.userId;

    // In a real application, you would check if user has admin privileges

    const thread = await DiscussionThread.findByPk(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: "Thread tidak ditemukan",
      });
    }

    const updates = {};
    if (typeof isPinned !== 'undefined') updates.isPinned = isPinned;
    if (typeof isClosed !== 'undefined') updates.isClosed = isClosed;

    await thread.update(updates);

    res.json({
      success: true,
      message: "Status thread berhasil diperbarui",
      data: thread
    });
  } catch (error) {
    console.error("Error updating thread status:", error);
    res.status(500).json({
      success: false,
      error: "Gagal memperbarui status thread",
    });
  }
};

// Delete thread (admin only)
export const deleteThread = async (req, res) => {
  try {
    const { id } = req.params;

    const thread = await DiscussionThread.findByPk(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        error: "Thread tidak ditemukan",
      });
    }

    // Delete all messages first
    await DiscussionMessage.destroy({ where: { threadId: id } });
    
    // Then delete the thread
    await thread.destroy();

    res.json({
      success: true,
      message: "Thread berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting thread:", error);
    res.status(500).json({
      success: false,
      error: "Gagal menghapus thread",
    });
  }
};