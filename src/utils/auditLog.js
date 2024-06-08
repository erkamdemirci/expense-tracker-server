// utils/auditLog.js
const AuditLog = require('../models/auditLog');

const createAuditLog = async (user, action, details = '') => {
  try {
    const log = new AuditLog({
      user,
      action,
      details
    });
    await log.save();
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
};

module.exports = createAuditLog;
