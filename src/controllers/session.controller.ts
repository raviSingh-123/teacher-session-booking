
import { Request, Response, NextFunction } from "express";
import Teacher from "../models/teacher.model";
import Session , {SessionStatus } from "../models/session.model";
import User from "../models/user.model";
import mongoose from "mongoose";


export const createSession = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { teacherId, startTime, endTime } = req.body;

        // 1. Validate required fields
        if (!teacherId || !startTime || !endTime) {
            res.status(400).json({
                success: false,
                message: "teacherId, startTime and endTime are required"
            });
            return;
        }

        // 2. Validate date values
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime())
        ) {
            res.status(400).json({
                success: false,
                message: "Invalid startTime or endTime"
            });
            return;
        }

        // 3. Validate endTime is greater than startTime
        if (end <= start) {
            res.status(400).json({
                success: false,
                message: "endTime must be greater than startTime"
            });
            return;
        }

        // 4. Check whether teacher exists
        const teacher = await Teacher.findById(teacherId);

        if (!teacher) {
            res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
            return;
        }

        // 5. Create session
        const session = await Session.create({
            teacherId,
            startTime: start,
            endTime: end
        });

        res.status(201).json({
            success: true,
            message: "Session created successfully",
            data: session
        });

    } catch (error) {
        next(error);
    }
};



export const getAvailableSessions = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const dateTimestamp = Number(req.query.dateTimestamp);

        if (!req.query.dateTimestamp || Number.isNaN(dateTimestamp)) {
            res.status(400).json({
                success: false,
                message: "Valid dateTimestamp is required"
            });
            return;
        }

        const selectedDate = new Date(dateTimestamp);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const sessions = await Session.aggregate([
            {
                $match: {
                    status: "AVAILABLE",
                    startTime: {
                        $gte: startOfDay,
                        $lte: endOfDay
                    }
                }
            },
            {
                $lookup: {
                    from: "teachers",
                    localField: "teacherId",
                    foreignField: "_id",
                    as: "teacher"
                }
            },
            {
                $unwind: "$teacher"
            }
        ]);

        res.status(200).json({
            success: true,
            count: sessions.length,
            data: sessions
        });
    } catch (error) {
        next(error);
    }
};


export const bookSession = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id;
        const { userId } = req.body;

        // Validate IDs
        if (
            typeof id !== "string" ||
            !/^[0-9a-fA-F]{24}$/.test(id) ||
            typeof userId !== "string" ||
            !/^[0-9a-fA-F]{24}$/.test(userId)
        ) {
            res.status(400).json({
                success: false,
                message: "Valid session ID and userId are required"
            });
            return;
        }

        // Check whether user exists
        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // Check whether session exists
        const session = await Session.findById(id);

        if (!session) {
            res.status(404).json({
                success: false,
                message: "Session not found"
            });
            return;
        }

        // Check session availability
        if (session.status !== "AVAILABLE") {
            res.status(409).json({
                success: false,
                message: "Session is already booked or completed"
            });
            return;
        }

        // Book the session
        const bookedSession = await Session.findOneAndUpdate(
            {
                _id: new mongoose.Types.ObjectId(id),
                status: SessionStatus.AVAILABLE
            },
            {
                $set: {
                    userId: user._id,
                    status: SessionStatus.BOOKED
                }
            },
            {
                returnDocument: "after",
                runValidators: true
            }
        );

        if (!bookedSession) {
            res.status(409).json({
                success: false,
                message: "Session is no longer available"
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Session booked successfully",
            data: bookedSession
        });
    } catch (error) {
        next(error);
    }
};


export const completeSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    if (
      typeof id !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid session ID"
      });
      return;
    }

    const session = await Session.findById(id);

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found"
      });
      return;
    }

    if (session.status !== SessionStatus.BOOKED) {
      res.status(409).json({
        success: false,
        message: "Only booked sessions can be completed"
      });
      return;
    }

    const completedSession = await Session.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(id),
        status: SessionStatus.BOOKED
      },
      {
        $set: {
          status: SessionStatus.COMPLETED,
          completedAt: new Date()
        }
      },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!completedSession) {
      res.status(409).json({
        success: false,
        message: "Session is no longer available for completion"
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Session completed successfully",
      data: completedSession
    });
  } catch (error) {
    next(error);
  }
};