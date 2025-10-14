/**
 * File: sessions.js
 * Mục đích: Định nghĩa routes cho Session APIs
 * Vai trò:
 *   - Map HTTP methods đến session controller functions
 *   - Định nghĩa Swagger documentation cho endpoints
 * Lưu ý:
 *   - Routes này handle prefix /api/sessions (defined in app.js)
 *   - Session data lưu trong SQL Server
 *   - Cần kiểm tra quyền truy cập (chỉ tutor/student liên quan)
 */

const express = require('express');
const router = express.Router();
const {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
} = require('../controllers/sessionController');

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Session management API (SQL Server)
 */

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     responses:
 *       200:
 *         description: List of sessions
 */
router.get('/', getSessions);

/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get session by ID
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session details
 *       404:
 *         description: Session not found
 */
router.get('/:id', getSessionById);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create new session
 *     tags: [Sessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tutorId
 *               - studentId
 *               - subject
 *               - scheduledAt
 *               - duration
 *             properties:
 *               tutorId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               subject:
 *                 type: string
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 */
router.post('/', createSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session updated
 */
router.put('/:id', updateSession);

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete session
 *     tags: [Sessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session deleted
 */
router.delete('/:id', deleteSession);

module.exports = router;
