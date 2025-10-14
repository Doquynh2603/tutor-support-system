/**
 * File: sessionController.js
 * Mục đích: Controller xử lý logic nghiệp vụ cho Sessions
 * Vai trò:
 *   - CRUD operations cho Session model (SQL Server)
 *   - Quản lý buổi học giữa tutor và student
 * Lưu ý:
 *   - Sử dụng Sequelize methods (findAll, findByPk, create, update, destroy)
 *   - Cần validate tutorId và studentId có tồn tại trong Users
 *   - Có thể emit Socket.IO event khi session status thay đổi
 */

const Session = require('../models/Session');

/**
 * @desc    Get all sessions
 * @route   GET /api/sessions
 * @access  Public
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await Session.findAll();

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single session
 * @route   GET /api/sessions/:id
 * @access  Public
 */
const getSessionById = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

/**
 * @desc    Create new session
 * @route   POST /api/sessions
 * @access  Public
 */
const createSession = async (req, res) => {
  try {
    const session = await Session.create(req.body);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
};

/**
 * @desc    Update session
 * @route   PUT /api/sessions/:id
 * @access  Public
 */
const updateSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await session.update(req.body);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Bad Request',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete session
 * @route   DELETE /api/sessions/:id
 * @access  Public
 */
const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found',
      });
    }

    await session.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};
