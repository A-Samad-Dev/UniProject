const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const prisma = require("./lib/prisma");
const { logger, accessLogger } = require("./src/config/logger");
const {
  httpLogger,
  requestLogger,
  errorLogger,
} = require("./middlewares/logging");

const app = express();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

const PORT = process.env.PORT;

// PUBLIC ROUTES
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/applicants", require("./routes/applicantRoute"));



// PROTECTED ROUTES

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/lecturer", require("./routes/lecturerRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/results", require("./routes/resultRoutes"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(errorLogger);

app.use((err, req, res, next) => {
  logger.error("unhandled error", {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

async function startServer() {
  try {
    await prisma.$connect();
    // console.log("Password Value:", process.env.DATABASE_URL);
    logger.info("✅ Database connected successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Failed to connect to database", { error: err.message });
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  logger.info("Disconnected from database");
  process.exit(0);
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection", { reason: reason, promise: promise });
});
