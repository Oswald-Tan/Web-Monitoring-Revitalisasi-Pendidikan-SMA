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
import crypto from "crypto";
import fs from "fs";

// Mendapatkan direktori saat ini
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

import Auth from "./routes/authRoute.js";
import Users from "./routes/usersRoute.js";
import AuditLog from "./routes/auditLogRoute.js";
import School from "./routes/schoolRoute.js";
import SchoolDetail from "./routes/schoolDetailRoutes.js";
import RabItem from "./routes/rabRoute.js";
import DailyReport from "./routes/dailyReportRoute.js";
import WeeklyReviewRoutes from "./routes/weeklyReviewRoute.js";
import MonthlyReport from "./routes/monthlyReportRoute.js";
import TimeSchedule from "./routes/timeScheduleRoute.js";
import FinalReport from "./routes/finalReport.js";
import Document from "./routes/documentRoute.js";
import CalenderEvent from "./routes/calenderRoute.js";
import DiscussionThread from "./routes/discussionThreadsRoute.js";
import Personnel from "./routes/personnelRoute.js";
import Role from "./routes/roleRoute.js";
import Assignment from "./routes/assignmentRoute.js";
import Dashboard from "./routes/dashboardRoute.js";
import Contact from "./routes/contactRoutes.js";

const app = express();

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.105.53:8080"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

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
app.use(express.urlencoded({ extended: true }));

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
    },
  })
);

app.get("/api/v1/hello-world", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});

app.use("/api/v1/auth", sessionMiddleware, Auth);
app.use("/api/v1/users", sessionMiddleware, Users);
app.use("/api/v1/audit-logs", sessionMiddleware, AuditLog);
app.use("/api/v1/schools", sessionMiddleware, School);
app.use("/api/v1/school-details", sessionMiddleware, SchoolDetail);
app.use("/api/v1/rab-items", sessionMiddleware, RabItem);
app.use("/api/v1/daily-reports", sessionMiddleware, DailyReport);
app.use("/api/v1/weekly-reviews", sessionMiddleware, WeeklyReviewRoutes);
app.use("/api/v1/monthly-reports", sessionMiddleware, MonthlyReport);
app.use("/api/v1/time-schedules", sessionMiddleware, TimeSchedule);
app.use("/api/v1/final-reports", sessionMiddleware, FinalReport);
app.use("/api/v1/documents", sessionMiddleware, Document);
app.use("/api/v1/calendar-events", sessionMiddleware, CalenderEvent);
app.use("/api/v1/discussion-threads", sessionMiddleware, DiscussionThread);
app.use("/api/v1/personnel", sessionMiddleware, Personnel);
app.use("/api/v1/roles", sessionMiddleware, Role);
app.use("/api/v1/assignments", sessionMiddleware, Assignment);
app.use("/api/v1/dashboard", sessionMiddleware, Dashboard);
app.use("/api/v1/contact", sessionMiddleware, Contact);

// Setup Socket.IO dengan session middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Handle connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  
  // Middleware untuk mendapatkan user info dari session
  const userId = socket.request.session?.userId;
  if (!userId) {
    console.log("Unauthorized socket connection");
    socket.disconnect();
    return;
  }

  // Join room berdasarkan threadId
  socket.on("join_thread", (threadId) => {
    socket.join(`thread_${threadId}`);
    console.log(`User ${userId} joined thread_${threadId}`);
  });

  // Leave room
  socket.on("leave_thread", (threadId) => {
    socket.leave(`thread_${threadId}`);
    console.log(`User ${userId} left thread_${threadId}`);
  });

  // Handle new message
  socket.on("new_message", async (data) => {
    try {
      const { threadId, message, parentId } = data;
      
      // Simpan pesan ke database (gunakan controller yang sudah ada)
      // Di sini kita akan memanfaatkan controller addMessage yang sudah ada
      // Untuk simplicity, kita akan memanggil fungsi langsung
      
      // Simulasi: dapatkan user dari session
      const user = await User.findByPk(userId);
      
      // Broadcast pesan ke semua user di room thread
      const messageData = {
        id: Date.now(), // ID sementara, akan diganti dengan ID dari database
        threadId,
        message,
        parentId,
        author: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        createdAt: new Date()
      };
      
      io.to(`thread_${threadId}`).emit("receive_message", messageData);
    } catch (error) {
      console.error("Error handling new message:", error);
      socket.emit("error", "Gagal mengirim pesan");
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Simpan instance io agar bisa diakses di controller
app.set("io", io);


const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
