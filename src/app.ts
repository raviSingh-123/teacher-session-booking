import express from "express";
import userRoutes from "./routes/user.routes";
import sessionRoutes from "./routes/session.routes";
import errorHandler from "./middlewares/error.middleware";

const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.use("/users", userRoutes);
app.use("/sessions", sessionRoutes);
app.use(errorHandler);
export default app;