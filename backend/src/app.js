import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import SequelizeStore from "connect-session-sequelize";
import { Server } from "socket.io";
import http from "http";
import db from "./config/database.js";
import path from "path";
import { fileURLToPath } from "url";
import cron from "node-cron";
import { Op } from "sequelize";
import crypto from "crypto";
import fs from "fs";

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import associateModels from "./models/associate.js";
import Attendance from "./models/attendance.js";
import Event from "./models/event.js";
import User from "./models/user.js";


import Auth from "./routes/authRoute.js";
import Users from "./routes/usersRoute.js";
import Mahasiswa from "./routes/mahasiswaRoute.js";
import Dosen from "./routes/dosenRoute.js";
import Events from "./routes/eventRoute.js";
import Attendances from "./routes/attendanceRoute.js";
import Notification from "./routes/notification.js";
import Document from "./routes/documentRoutes.js";
import Arsip from "./routes/arsipRoute.js";
import Surat from "./routes/suratRoute.js"
import AuditLog from "./routes/auditLogRoute.js";
import Kelas from "./routes/kelasRoute.js";
import Matkul from "./routes/matkulRoute.js";
import JadwalMatkul from "./routes/jadwalMatkulRoute.js"
import JadwalJamIstirahat from "./routes/jadwalJamIstirahatRoute.js";
import { sendEventNotification } from "./controllers/notificationController.js";

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.105.53:8080"], 
    methods: ["GET", "POST"],
    credentials: true,
  }
});

associateModels();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

// store.sync(); //untuk buat table sessions nya

// app.use(
//   session({
//     secret: process.env.SESS_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     store: store, //simpan session ke database
//     cookie: {
//       secure: "auto",
//     },
//   })
// );

const sessionMiddleware = session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: true,
  store: store, // Simpan session ke database
  cookie: {
    secure: "auto",
  },
});

app.use(express.json());

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path) => {
      // Cache-Control
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    
      // ETag secara sinkron
      try {
        const fileBuffer = fs.readFileSync(path);
        const hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
        res.setHeader("ETag", hash);
      } catch (error) {
        console.error("Error generating ETag:", error);
      }
    }
    
  })
);

app.get("/api/v1/hello-world", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.use("/api/v1/auth", sessionMiddleware, Auth);
app.use("/api/v1/users", sessionMiddleware, Users);
app.use("/api/v1/mahasiswa", sessionMiddleware, Mahasiswa);
app.use("/api/v1/dosen", sessionMiddleware, Dosen);
app.use("/api/v1/event", sessionMiddleware, Events);
app.use("/api/v1/attendance", sessionMiddleware, Attendances);
app.use("/api/v1/notification", sessionMiddleware, Notification);
app.use("/api/v1/document", sessionMiddleware, Document);
app.use("/api/v1/arsip", sessionMiddleware, Arsip);
app.use("/api/v1/surat", sessionMiddleware, Surat);
app.use("/api/v1/audit-logs", sessionMiddleware, AuditLog);
app.use("/api/v1/kelas", sessionMiddleware, Kelas);
app.use("/api/v1/matkul", sessionMiddleware, Matkul);
app.use("/api/v1/jadwal-matkul", sessionMiddleware, JadwalMatkul);
app.use("/api/v1/jadwal-jam-istirahat", sessionMiddleware, JadwalJamIstirahat);

// =============================================
// CRON JOB UNTUK UPDATE STATUS EVENT
// =============================================

// Fungsi untuk update status event
const updateEventStatuses = async () => {
  try {
    console.log('[CRON] Memulai update status event...');
    await Event.updateStatuses();
    console.log('[CRON] Update status event selesai');
  } catch (error) {
    console.error('[CRON] Error saat update status event:', error.message);
  }
};

// Jadwalkan update status event setiap 5 menit
cron.schedule('*/5 * * * *', updateEventStatuses);

// Jalankan segera setelah server start
setTimeout(updateEventStatuses, 10000);

// =============================================
// CRON JOB UNTUK PENGINGAT EVENT
// =============================================

const sendReminderEmails = async () => {
  try {
    console.log("[CRON] Memeriksa event untuk pengingat...");
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Cari event yang akan dimulai dalam 1 jam
    const upcomingEvents = await Event.findAll({
      where: {
        start: {
          [Op.between]: [now, oneHourLater],
        },
      },
    });

    if (upcomingEvents.length === 0) {
      console.log("[CRON] Tidak ada event yang memerlukan pengingat");
      return;
    }

    console.log(`[CRON] Menemukan ${upcomingEvents.length} event yang perlu dikirim pengingat`);

    // Proses setiap event
    for (const event of upcomingEvents) {
      try {
        console.log(`[CRON] Memproses event: ${event.title} (ID: ${event.id})`);
        
        // Dapatkan peserta yang BELUM dikirim reminder
        const attendances = await Attendance.findAll({
          where: { 
            event_id: event.id,
            reminder_sent: false // Hanya yang belum dikirim
          },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'fullname', 'email'],
            },
          ],
        });

        if (attendances.length === 0) {
          console.log(`[CRON] Semua peserta event ${event.id} sudah dikirimi reminder`);
          continue;
        }

        console.log(`[CRON] Mengirim email ke ${attendances.length} peserta`);

        // Kirim email ke setiap peserta
        const emailPromises = attendances.map(async (attendance) => {
          if (attendance.user?.email) {
            try {
              await sendEventNotification(
                attendance.user,
                event,
                'reminder'
              );
              console.log(`[CRON] Email terkirim ke: ${attendance.user.email}`);
              
              // TANDAI SUDAH DIKIRIM
              await attendance.update({ reminder_sent: true });
              return true;
            } catch (error) {
              console.error(`[CRON] Gagal mengirim email ke ${attendance.user.email}:`, error.message);
              return false;
            }
          }
          return false;
        });

        const results = await Promise.all(emailPromises);
        const successCount = results.filter(success => success).length;
        
        console.log(`[CRON] Berhasil mengirim ${successCount}/${attendances.length} email untuk event ${event.id}`);
      } catch (eventError) {
        console.error(`[CRON] Error memproses event ${event.id}:`, eventError.message);
      }
    }
  } catch (mainError) {
    console.error("[CRON] Error utama dalam pengiriman pengingat:", mainError.message);
  }
};

// =============================================
// JADWALKAN CRON JOB
// =============================================

// Jadwalkan pengecekan setiap 5 menit (untuk keandalan)
cron.schedule("*/5 * * * *", async () => {
  console.log(`[CRON] Menjalankan pengecekan pengingat pada: ${new Date().toISOString()}`);
  await sendReminderEmails();
});

// Jalankan segera setelah server start (untuk testing)
// setTimeout(sendReminderEmails, 10000);

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
