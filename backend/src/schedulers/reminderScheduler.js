import cron from 'node-cron';
import { Op } from 'sequelize';
import Notification from '../models/notification.js';
import User from '../models/user.js';
import Event from '../models/event.js';
import { sendEventNotification } from '../controllers/notificationController.js';

// Jalankan setiap jam
cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    
    // Dapatkan event yang akan dimulai dalam 1 jam
    const upcomingEvents = await Event.findAll({
      where: {
        start: {
          [Op.between]: [now, oneHourLater]
        }
      }
    });

    for (const event of upcomingEvents) {
      // Dapatkan semua notifikasi reminder yang belum dikirim
      const notifications = await Notification.findAll({
        where: {
          event_id: event.id,
          channel: 'email',
          status: 'pending',
          type: 'reminder'
        },
        include: [
          { 
            model: User, 
            as: 'recipient',
            include: [{ model: DetailsUsers }]
          }
        ]
      });

      for (const notification of notifications) {
        try {
          await sendEventNotification(
            notification.recipient,
            event,
            'reminder'
          );
          await notification.update({ status: 'sent' });
          console.log(`Sent reminder for event ${event.id} to ${notification.recipient.email}`);
        } catch (error) {
          await notification.update({ status: 'failed' });
          console.error(`Failed to send reminder to ${notification.recipient.email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in reminder scheduler:', error);
  }
});