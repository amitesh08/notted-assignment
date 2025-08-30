import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/database";
import authRoutes from "./routes/authRoutes";
import notesRoutes from "./routes/notesRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Test database connection
app.get("/api/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({
      message: "Server is running!",
      database: "Connected to PostgreSQL",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      message: "Server running but database connection failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global error handler
app.use(
  (
    error: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`📝 Notes endpoints: http://localhost:${PORT}/api/notes`);
});

//shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});
