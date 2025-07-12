import transporter from "../config/email.js";
import DetailsUsers from "../models/details_users.js";
import Event from "../models/event.js";
import Notification from "../models/notification.js";
import User from "../models/user.js";

export const sendEventNotification = async (
  recipient,
  event,
  type = "invitation"
) => {
  try {
    let subject, text, html;

    if (type === "invitation") {
      subject = `Undangan Kegiatan: ${event.title}`;
      text = `Anda diundang dalam kegiatan:\n\nJudul: ${
        event.title
      }\nDeskripsi: ${event.description}\nWaktu: ${new Date(
        event.start
      ).toLocaleString()} - ${new Date(event.end).toLocaleString()}\nLokasi: ${
        event.location
      }`;

      // Template HTML baru dengan gaya mirip reminder
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">Undangan Kegiatan</h1>
            <p style="color: #4b5563;">Anda diundang untuk menghadiri kegiatan berikut</p>
          </div>
          
          <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">${
              event.title
            }</h2>
            
            <div style="margin-bottom: 20px;">
              <p style="color: #4b5563; margin-bottom: 4px;"><strong>Deskripsi:</strong></p>
              <p style="color: #1f2937; margin-top: 0;">${
                event.description || "-"
              }</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>🕒 Waktu Mulai:</strong></p>
                <p style="color: #1f2937; margin: 0;">${new Date(event.start).toLocaleString()}</p>
              </div>

              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>🕒 Waktu Selesai:</strong></p>
                <p style="color: #1f2937; margin: 0;">${new Date(event.end).toLocaleString()}</p>
              </div>

              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>📍 Lokasi:</strong></p>
                <p style="color: #1f2937; margin: 0;">${event.location || "-"}</p>
              </div>
            </div>

            
            <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #1e40af; margin: 0;">
                Harap konfirmasi kehadiran Anda secepatnya
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Salam hangat,<br>Tim Event Management</p>
            <p style="margin-top: 12px;">Jika Anda tidak bisa menghadiri, harap beri tahu penyelenggara.</p>
          </div>
        </div>
      `;
    } else if (type === "reminder") {
      // Hitung waktu tersisa hingga event
      const eventStart = new Date(event.start);
      const now = new Date();
      const diffMs = eventStart - now;
      const diffMins = Math.round(diffMs / 60000); // Konversi milidetik ke menit

      // Tentukan teks berdasarkan sisa waktu
      let timeText;
      if (diffMins >= 60) {
        const hours = Math.floor(diffMins / 60);
        timeText = `akan dimulai dalam ${hours} jam${hours > 1 ? "" : ""}`;
      } else if (diffMins > 0) {
        timeText = `akan dimulai dalam ${diffMins} menit`;
      } else {
        timeText = "akan segera dimulai";
      }

      subject = `⏰ Pengingat: Event "${event.title}" ${timeText}!`;

      text = `Hai ${recipient.fullname},\n\nEvent "${
        event.title
      }" ${timeText}:\n\nWaktu: ${eventStart.toLocaleString()}\nLokasi: ${
        event.location
      }\n\nHarap persiapkan diri Anda!`;

      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 24px; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">Pengingat Event</h1>
            <p style="color: #4b5563;">Jangan lupa event Anda akan segera dimulai</p>
          </div>
          
          <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 12px;">
              ${event.title}
            </h2>
            
            <div style="margin-bottom: 20px;">
              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>🕒 Waktu Mulai:</strong></p>
                <p style="color: #1f2937; margin: 0;">${eventStart.toLocaleString()}</p>
              </div>

              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>📍 Lokasi:</strong></p>
                <p style="color: #1f2937; margin: 0;">${event.location || "-"}</p>
              </div>

              <div style="margin-bottom: 12px;">
                <p style="color: #4b5563; margin: 0 0 4px;"><strong>⏰ Status:</strong></p>
                <p style="color: #ef4444; font-weight: bold; margin: 0;">Event ${timeText}!</p>
              </div>
            </div>

            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #b91c1c; margin: 0;">
                Harap persiapkan diri Anda dan datang tepat waktu
              </p>
            </div>

            <!-- ✅ Bagian tambahan untuk instruksi absen -->
            <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; border-radius: 4px; margin-bottom: 20px;">
              <p style="color: #065f46; margin: 0;">
                Setelah kegiatan dimulai, jangan lupa untuk mengisi <strong>absen kehadiran</strong> melalui website resmi kami.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>Salam hangat,<br>Tim Event Management</p>
            <p style="margin-top: 12px;">Jika Anda tidak bisa hadir, harap beri tahu penyelenggara.</p>
          </div>
        </div>
      `;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: recipient.email,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${recipient.email}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${recipient.email}:`, error);
    throw error;
  }
};

export const sendNotificationNow = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id, {
      include: [
        { model: Event, as: "event" },
        {
          model: User,
          as: "recipient",
          include: [{ model: DetailsUsers }], // Untuk mendapatkan detail tambahan
        },
      ],
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Kirim email jika channel adalah email
    if (notification.channel === "email") {
      await sendEventNotification(
        notification.recipient,
        notification.event,
        notification.type || "invitation" // invitation/reminder
      );
    }
    // Untuk WhatsApp bisa ditambahkan integrasi API lain di sini

    // Update status notifikasi
    await notification.update({ status: "sent" });

    res.json({ message: "Notification sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fungsi baru untuk mengirim pengingat massal
export const sendBulkReminders = async (req, res) => {
  try {
    const { eventId, hoursBefore = 24 } = req.body;

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    // Dapatkan semua notifikasi yang perlu dikirim
    const notifications = await Notification.findAll({
      where: {
        event_id: eventId,
        channel: "email",
        status: "pending",
        scheduled_at: { [Op.lte]: new Date() },
      },
      include: [
        {
          model: User,
          as: "recipient",
          include: [{ model: DetailsUsers }],
        },
      ],
    });

    // Kirim email ke semua peserta
    const sendPromises = notifications.map(async (notification) => {
      try {
        await sendEventNotification(notification.recipient, event, "reminder");
        await notification.update({ status: "sent" });
        return { success: true, email: notification.recipient.email };
      } catch (error) {
        await notification.update({ status: "failed" });
        return { success: false, email: notification.recipient.email, error };
      }
    });

    const results = await Promise.all(sendPromises);

    res.json({
      message: "Bulk reminders processed",
      successCount: results.filter((r) => r.success).length,
      failedCount: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
