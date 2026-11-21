import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
}

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);

  // Duplicate MongoDB value (for example, unique email)
  if (err.code === 11000) {
    res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
      errors: err.keyValue
    });
    return;
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format"
    });
    return;
  }

  // Mongoose validation errors
  if (err.name === "ValidationError") {
    res.status(400).json({
      success: false,
      message: err.message
    });
    return;
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.statusCode
      ? err.message
      : "Internal server error"
  });
};

export default errorHandler;