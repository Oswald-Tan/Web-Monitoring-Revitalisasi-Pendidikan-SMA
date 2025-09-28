import bcrypt from "bcrypt";
import User from "../models/user.js";
import Role from "../models/role.js";
import transporter from "../config/email.js";
import crypto from "crypto";
import { logAction } from "../middleware/auditMiddleware.js";

//handle login
export const handleLogin = async (req, res) => {
  try {
    // Validasi input
    if (!req.body || !req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Role,
          as: "userRole",
          attributes: ["role_name"],
        },
      ],
    });

    if (!user) {
      await logAction(
        req,
        "login_failed",
        "user",
        null,
        `Percobaan login dengan email ${email}`
      );
      return res.status(404).json({ message: "User not found" });
    }


    const match = await bcrypt.compare(password, user.password); // Gunakan variabel password
    if (!match) {
      await logAction(
        req,
        "login_failed",
        "user",
        user.id,
        `Password salah untuk email ${email}`,
        null,
        { attempts: user.login_attempts }
      );
      return res.status(400).json({ message: "Wrong Password" });
    }

    if (
      user.userRole.role_name !== "super_admin" &&
      user.userRole.role_name !== "admin_pusat" &&
      user.userRole.role_name !== "admin_sekolah" &&
      user.userRole.role_name !== "fasilitator" &&
      user.userRole.role_name !== "koordinator"
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

    req.session.userId = user.id;
    req.session.role = user.userRole.role_name;

    await logAction(
      req,
      "login",
      "user",
      user.id,
      `Login berhasil sebagai ${user.userRole.role_name}`
    );

    // PERBAIKAN: Hapus deklarasi ulang email
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email, // Langsung gunakan user.email
      phone_number: user.phone_number,
      role: user.userRole.role_name,
    });
  } catch (error) {
    await logAction(
      req,
      "system_error",
      "auth",
      null,
      `Login error: ${error.message}`,
      null,
      { email: req.body.email } // Gunakan req.body.email karena variabel email mungkin belum terdefinisi
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
        "name",
        "email",
        "phone_number",
        "role_id",
      ], 
      include: [
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
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.userRole.role_name,
    });
  } catch (error) {
    console.error("Me error:", error);
    res.status(500).json({ message: "Terjadi kesalahan di server." });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.session.userId;
  
  if (!userId) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const { name, email, phone_number } = req.body;

    // Validasi email unik (kecuali milik sendiri)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already in use" });
      }
    }

    // Update hanya field yang diizinkan
    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone_number: phone_number || user.phone_number,
    });

    // Dapatkan data terbaru dengan role
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "phone_number"],
      include: [{
        model: Role,
        as: "userRole",
        attributes: ["role_name"],
      }],
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone_number: updatedUser.phone_number,
      role: updatedUser.userRole.role_name,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
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
