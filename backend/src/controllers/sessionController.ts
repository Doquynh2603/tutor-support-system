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

import { Request, Response } from "express";
import Session from "../models/Session";

/**
 * @desc    Get all sessions
 * @route   GET /api/sessions
 * @access  Public
 */
interface SessionData {
  session_id?: string;
  tutor_id?: string;
  student_id?: string;
  class_id?: string;
  session_date?: Date;
  start_time?: string;
  end_time?: string;
  status?: string;
  notes?: string;
}

const getSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📋 [getSessions] Fetching all sessions...");
    const sessions = await Session.findAll();
    console.log(`✅ [getSessions] Found ${sessions.length} sessions`);
    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single session
 * @route   GET /api/sessions/:id
 * @access  Public
 */
const getSessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("📋 [getSessionById] ID:", id);

    const session = await Session.findByPk(id);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }
    console.log(`✅ [getSessionById] Found session ${id}`);
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

/**
 * @desc    Create new session
 * @route   POST /api/sessions
 * @access  Public
 */
const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("📝 [createSession] Creating session...");

    const session = await Session.create(req.body);

    console.log(
      `✅ [createSession] Session created: ${(session as any).session_id}`
    );

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

/**
 * @desc    Update session
 * @route   PUT /api/sessions/:id
 * @access  Public
 */
const updateSession = async (
  req: Request<{ id: string }, never, SessionData>,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("📝 [updateSession] ID:", id);

    const session = await Session.findByPk(id);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    await session.update(req.body as any);
    console.log(`✅ [updateSession] Session updated: ${id}`);
    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: "Bad Request",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete session
 * @route   DELETE /api/sessions/:id
 * @access  Public
 */
const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log("📝 [deleteSession] ID:", id);

    const session = await Session.findByPk(id);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    await session.destroy();
    console.log(`✅ [deleteSession] Session deleted: ${id}`);
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export default {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
};
