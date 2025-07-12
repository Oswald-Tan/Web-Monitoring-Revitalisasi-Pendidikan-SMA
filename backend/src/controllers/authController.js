import bcrypt from "bcrypt";
import User from "../models/user.js";
import Role from "../models/role.js";
import transporter from "../config/email.js";
import crypto from "crypto";
import DetailsUsers from "../models/details_users.js";
import { logAction } from "../middleware/auditMiddleware.js";
import { DetailDosen, Dosen } from "../models/dosen.js";

//handle login
export const handleLogin = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.body.username },
      include: [
        {
          model: DetailsUsers,
          as: "userDetails",
          attributes: ["photo_profile"],
        },
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user) {
      // AUDIT LOG: Catat percobaan login gagal
      await logAction(
        req,
        "login_failed",
        "user",
        null,
        `Percobaan login dengan username ${req.body.username}`
      );
      return res.status(404).json({ message: "User not found" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ message: "Account is inactive." });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      // AUDIT LOG: Catat percobaan password salah
      await logAction(
        req,
        "login_failed",
        "user",
        user.id,
        `Password salah untuk username ${req.body.username}`,
        null,
        { attempts: user.login_attempts } // Simpan jumlah percobaan
      );
      return res.status(400).json({ message: "Wrong Password" });
    }

    if (
      user.userRole.role_name !== "admin_jurusan" &&
      user.userRole.role_name !== "admin" &&
      user.userRole.role_name !== "dosen"
    ) {
      await logAction(
        req,
        "login_unauthorized",
        "user",
        user.id,
        `Role tidak diizinkan: ${user.userRole.role_name}`
      );
      return res
        .status(403)
        .json({ message: "Access denied. Unauthorized role." });
    }

    // Simpan session user
    req.session.userId = user.id;

    // AUDIT LOG: Catat login berhasil
    await logAction(
      req,
      "login",
      "user",
      user.id,
      `Login berhasil sebagai ${user.userRole.role_name}`
    );

    // Ambil informasi yang akan dikirim ke frontend
    const id = user.id;
    const username = user.username;
    const fullname = user.fullname;
    const email = user.email;
    const photo = user.userDetails?.photo_profile ?? null;
    const role = user.userRole.role_name;

    const prodiAdmin = user.prodiAdmin;
    const prodiDosen = user.prodiDosen;

    res
      .status(200)
      .json({
        id,
        username,
        fullname,
        email,
        photo,
        role,
        prodiAdmin,
        prodiDosen,
      });
  } catch (error) {
    await logAction(
      req,
      "system_error",
      "auth",
      null,
      `Login error: ${error.message}`,
      null,
      { username: req.body.username }
    );
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const Me = async (req, res) => {
  try {
    // Cek apakah user sudah login (punya session)
    if (!req.session.userId) {
      return res.status(401).json({ message: "Mohon login ke akun Anda!" });
    }

    // Ambil data user berdasarkan session userId
    const user = await User.findOne({
      attributes: [
        "id",
        "fullname",
        "email",
        "username",
        "role_id",
        "prodiAdmin",
        "prodiDosen",
      ], // ← Tambahkan "username"
      include: [
        {
          model: DetailsUsers,
          as: "userDetails",
          attributes: ["photo_profile"],
        },
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
      where: { id: req.session.userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Kirim data user lengkap
    res.status(200).json({
      id: user.id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      photo: user.userDetails?.photo_profile ?? null,
      role: user.userRole.role_name,
      prodiAdmin: user.prodiAdmin,
      prodiDosen: user.prodiDosen,
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server." });
  }
};

export const getDosenData = async (req, res) => {
  try {
    // Verifikasi session
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    console.log(`Fetching dosen data for user ID: ${userId}`);

    // Cek role user
    const user = await User.findByPk(userId, {
      include: [{
        model: Role,
        as: "userRole",
        attributes: ["role_name"],
      }]
    });

    if (!user) {
      console.log(`User not found for ID: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Debug: log role yang didapat
    console.log(`User role: ${JSON.stringify(user.userRole)}`);
    
    // Periksa jika userRole ada dan punya role_name
    if (!user.userRole || user.userRole.role_name.toLowerCase() !== "dosen") {
      console.log(`User role is not dosen: ${user.userRole ? user.userRole.role_name : 'no role'}`);
      return res.status(403).json({ message: "Forbidden for non-dosen role" });
    }

    // Ambil data dosen berdasarkan user ID
    const dosen = await Dosen.findOne({
      where: { userId: userId },
      include: [{
        model: DetailDosen,
        as: "detailDosen",
        required: false // Ini yang penting, biarkan false agar tetap return data dosen meski detail kosong
      }]
    });

    if (!dosen) {
      console.log(`Data dosen utama tidak ditemukan untuk user ID: ${userId}`);
      return res.status(404).json({ message: "Data dosen tidak ditemukan" });
    }

    // Format data yang akan dikirim
    const dosenData = {
      id: dosen.id,
      fullname: dosen.fullname,
      nip: dosen.nip,
      nidn: dosen.nidn,
      jenisKelamin: dosen.jenisKelamin,
      tempatLahir: dosen.tempatLahir,
      tglLahir: dosen.tglLahir,
      karpeg: dosen.karpeg,
      cpns: dosen.cpns,
      pns: dosen.pns,
      jurusan: dosen.jurusan,
      prodi: dosen.prodi,
      foto: dosen.foto,
      asKaprodi: dosen.asKaprodi,
      detailDosen: dosen.detailDosen || null, // Berikan array kosong jika null
    };

    console.log(`Mengembalikan data dosen untuk ID: ${dosen.id}`);
    res.status(200).json(dosenData);
  } catch (error) {
    console.error("Dosen data error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePassword = async (req, res) => {
  const id = req.params.id;

  try {
    // Ambil data user berdasarkan ID
    const user = await User.findOne({ where: { id: id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const email = user.email; // Ambil email dari user
    const password = `${email}123`; // Buat password baru

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));

    await User.update(
      {
        password: hashedPassword,
      },
      {
        where: { id: id },
      }
    );

    await logAction(
      req,
      "password_reset",
      "user",
      id,
      `Password direset oleh admin`,
      null,
      { by: req.session.userId } // ID admin yang melakukan reset
    );

    return res.status(200).json({
      message: "Password berhasil diubah.",
      success: true,
    });
  } catch (err) {
    console.log("Error saat update password:", err);
    return res.status(500).json({ message: err.message });
  }
};

//handle logout
export const handleLogout = async (req, res) => {
  if (req.session.userId) {
    await logAction(
      req,
      "logout",
      "user",
      req.session.userId,
      `User logout`
    );
  }

  req.session.destroy((err) => {
    if (err) return res.status(400).json({ message: "Logout failed" });
    res.status(200).json({ message: "Logout success" });
  });
};

export const requestResetOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Cari user berdasarkan email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    console.log(`User with email ${email} found.`);

    // Generate OTP
    const resetOtp = crypto.randomInt(100000, 999999).toString();
    console.log(`Generated OTP: ${resetOtp}`); // Logging OTP untuk debugging

    // Simpan OTP dan waktu kadaluarsa ke database
    user.resetOtp = resetOtp;
    user.resetOtpExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
    await user.save();

    // Kirim OTP ke email dengan styling
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP Code for Password Reset",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #007BFF;
              text-align: center;
            }
            p {
              font-size: 16px;
              text-align: center;
            }
            .otp {
              font-size: 24px;
              font-weight: bold;
              color: #007BFF;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Password Reset OTP</h1>
            <p>Your OTP code is:</p>
            <p class="otp">${resetOtp}</p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
    };

    // Logging data OTP dan waktu kadaluarsa untuk debugging
    console.log(
      `OTP Data to be Saved: resetOtp=${
        user.resetOtp
      }, resetOtpExpires=${new Date(user.resetOtpExpires).toISOString()}`
    );

    await transporter.sendMail(mailOptions);

    // AUDIT LOG: Catat permintaan OTP
    await logAction(
      req,
      "otp_request",
      "user",
      user.id,
      `Permintaan reset OTP dikirim ke ${email}`
    );

    res.status(200).json({ message: "OTP telah dikirim ke email Anda." });
  } catch (error) {
    console.error("Error in requestResetOtp:", error.message);
    res.status(500).json({
      message: "Terjadi kesalahan saat mengirim OTP",
      error: error.message,
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user || user.resetOtp !== otp || user.resetOtpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "OTP tidak valid atau telah kedaluwarsa" });
    }

    // OTP valid
    user.resetOtp = null;
    user.resetOtpExpires = null;
    await user.save();

    // AUDIT LOG: Catat verifikasi OTP berhasil
    await logAction(
      req,
      "otp_verify",
      "user",
      user.id,
      `OTP berhasil diverifikasi`
    );

    res.status(200).json({ message: "OTP berhasil diverifikasi" });
  } catch (error) {
    res.status(500).json({
      message: "Terjadi kesalahan saat memverifikasi OTP",
      error: error.message,
    });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return (
    password.length >= minLength && hasLetter && hasNumber && hasSpecialChar
  );
};

// Reset password after OTP verification
export const resetPassword = async (req, res) => {
  const { newPassword, confirmPassword, email } = req.body;

  try {
    // Validasi konfirmasi password
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password baru dan konfirmasi password tidak cocok" });
    }

    // Validasi password baru
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password baru harus memiliki minimal 8 karakter, mengandung huruf, angka, dan karakter khusus",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Enkripsi password baru
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database, reset attempts, and clear lockout
    await User.update(
      {
        password: hashedNewPassword,
        resetOtp: null,
        resetOtpExpires: null,
      },
      { where: { email } }
    );

    // AUDIT LOG: Catat reset password
    await logAction(
      req,
      "password_reset",
      "user",
      user.id,
      `Password berhasil direset melalui OTP`
    );

    res.status(200).json({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("Error resetting password:", err.message);
    return res.status(500).json({
      message: "Terjadi kesalahan saat mengubah password",
      error: err.message,
    });
  }
};

export const getResetOtpExpiry = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    if (!user.resetOtpExpires) {
      return res.status(400).json({ message: "OTP belum dibuat" });
    }

    res.status(200).json({ expiryTime: user.resetOtpExpires });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan", error: error.message });
  }
};
