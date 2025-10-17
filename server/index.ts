import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupWebSocket } from "./websocket";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Proxy /api/v1 requests to FastAPI backend on port 8000
app.use('/api/v1', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/api/v1/'  // Add /api/v1 back since Express strips it
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.originalUrl} -> http://localhost:8000/api/v1${req.url}`);
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  const server = app.listen(5000, "0.0.0.0", () => {
    console.log(`Server running on port 5000`);
  });

  // Setup WebSocket
  const { broadcast } = setupWebSocket(server);

  // Mock data simulator disabled - using real database
  // const simulator = createDataSimulator(broadcast);
  // simulator.start();

  // Cleanup on server shutdown
  // process.on('SIGINT', () => {
  //   simulator.stop();
  //   process.exit();
  // });

  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error(`Error: ${message}`, err);
    res.status(status).json({ message });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }
})();