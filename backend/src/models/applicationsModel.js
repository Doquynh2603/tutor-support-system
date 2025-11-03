const db = require("../config/sqlserver");

// rút đơn ứng tuyển
async function withdrawApplication(applicationId, tutorId, reason) {
  const pool = await db.getPool();
  const req = pool.request();
  req.input("ApplicationId", applicationId);
  req.input("TutorUserId", tutorId);
  req.input("Reason", reason || null);

  const result = await req.execute("sp_WithdrawApplication");
  return result;
}

module.exports = {
  withdrawApplication,
};
