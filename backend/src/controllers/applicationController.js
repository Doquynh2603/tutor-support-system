const applicationModel = require("../models/applicationsModel");

// rút đơn ứng tuyển
async function withdrawApplication(req, res, next) {
  try {
    console.log("🟢 [applicationController.withdrawApplication] START");
    console.log("📋 req.params:", req.params);
    console.log("📋 req.body:", req.body);
    console.log(
      "👤 req.user:",
      req.user ? { id: req.user.id, email: req.user.email } : "NO USER"
    );

    const applicationId = Number(req.params.id);
    const tutorId = req.user && req.user.id ? Number(req.user.id) : null;
    const { reason } = req.body;

    console.log("� Extracted values:", { applicationId, tutorId, reason });

    if (!tutorId) {
      console.log("❌ No tutorId");
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!applicationId) {
      console.log("❌ No applicationId");
      return res
        .status(400)
        .json({ success: false, message: "Invalid application ID" });
    }

    console.log("🔄 Calling withdrawApplication model...");
    const result = await applicationModel.withdrawApplication(
      applicationId,
      tutorId,
      reason
    );

    console.log("✅ Withdraw successful, result:", result);
    return res
      .status(200)
      .json({ success: true, message: "Withdrawn successfully", data: result });
  } catch (error) {
    console.error(
      "❌ [applicationController.withdrawApplication] Error:",
      error
    );
    return next(error);
  }
}

module.exports = {
  withdrawApplication,
};
