import User from "./user.js";
import Event from "./event.js";
import Attendance from "./attendance.js";
import Notification from "./notification.js";
import Surat from "./surat.js";
import AuditLog from "./audit_log.js";

export default function associateModels() {
  // User associations
  User.hasMany(Notification, {
    foreignKey: "recipient_id",
    as: "notifications",
  });
  User.hasMany(Event, { foreignKey: "organizer", as: "organized_events" });
  User.hasMany(Attendance, { foreignKey: "user_id", as: "attendances" });
  User.hasMany(Surat, { foreignKey: "user_id", as: "surats" });
  User.hasMany(AuditLog, {
    foreignKey: "userId",
    as: "auditLogs"
  });

  // Event associations
  Event.belongsTo(User, { foreignKey: "organizer", as: "organizer_details" });
  Event.hasMany(Attendance, { foreignKey: "event_id", as: "attendances" });
  Event.hasMany(Notification, { foreignKey: "event_id", as: "notifications" });

  // Attendance associations
  Attendance.belongsTo(Event, { foreignKey: "event_id", as: "event" });
  Attendance.belongsTo(User, { foreignKey: "user_id", as: "user" });

  // Notification associations
  Notification.belongsTo(Event, { foreignKey: "event_id", as: "event" });
  Notification.belongsTo(User, { foreignKey: "recipient_id", as: "recipient" });

  // Surat associations
  Surat.belongsTo(User, { foreignKey: "user_id", as: "user" });

   
  // Auditlog associations
  AuditLog.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
  });
}
