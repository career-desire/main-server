import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import coverLetterRoutes from "./routes/coverLetterRoutes.js"
import './config/firebase.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS Protection
// app.use(cors({ origin: false, credentials: true }));

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",")
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Apply security middlewares in production
if (process.env.NODE_ENV === "production") {
  // FIX: Properly use helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "script-src": ["'self'", "'wasm-unsafe-eval'"],
          "worker-src": ["'self'", "blob:"],
          "default-src": ["'self'"],
        },
      },
    })
  );

  app.use(mongoSanitize());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  });
  app.use("/api/", apiLimiter);
}

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve Vite frontend
const frontendPath = path.join(__dirname, "../client/dist");
app.use(express.static(frontendPath));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/cover-letter", coverLetterRoutes);

// Return 404 for unknown API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Serve frontend only if it's not an API route
app.use((req, res, next) => {
  const isAPI = req.path.startsWith("/api/");
  if (!isAPI) {
    res.sendFile(path.join(frontendPath, "index.html"));
  } else {
    next();
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}/`));