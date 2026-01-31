import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';
import razorpayWebhookRoutes from "./routes/razorpayWebhook";

const app = express();

// Security middleware
app.use(helmet());
const allowedOrigins = [
        "https://campus-lane.com",
        "https://www.campus-lane.com",
        "https://dashboard.campus-lane.com",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3000"
      ];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow mobile apps / curl

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// For preflight requests
app.options("*", cors());

app.use('/api/v1/webhooks', razorpayWebhookRoutes);

// General middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// API routes
app.use('/api/v1', routes);

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

export default app;