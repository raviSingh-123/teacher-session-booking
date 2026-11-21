
import { Request, Response, NextFunction } from "express";
import User from "../models/user.model";
import mongoose from "mongoose";
import Session from "../models/session.model";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fullName, email, phone } = req.body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      res.status(400).json({
        success: false,
        message: "fullName, email and phone are required"
      });
      return;
    }

    // Check whether email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "Email already exists"
      });
      return;
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      phone
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user
    });

  } catch (error) {
    next(error);
  }
};



export const getUserSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id;

    // Validate user ID
    if (
      typeof id !== "string" ||
      !/^[0-9a-fA-F]{24}$/.test(id)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
      return;
    }

    // Check whether user exists
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    // Get user's sessions using aggregation
    const sessions = await Session.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(id)
        }
      },
      {
        $facet: {
          upcomingSessions: [
            {
              $match: {
                status: "BOOKED"
              }
            },
            {
              $sort: {
                startTime: 1
              }
            }
          ],

          completedSessions: [
            {
              $match: {
                status: "COMPLETED"
              }
            },
            {
              $sort: {
                completedAt: -1
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "User sessions fetched successfully",
      data: {
        upcomingSessions: sessions[0].upcomingSessions,
        completedSessions: sessions[0].completedSessions
      }
    });

  } catch (error) {
    next(error);
  }
};