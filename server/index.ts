import express, { type Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from 'http-proxy-middleware';
// import { registerRoutes } from "./routes"; // Using FastAPI backend instead
import { setupVite, serveStatic } from "./vite";
import { setupWebSocket } from "./websocket";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Proxy all /api requests to FastAPI backend on port 8000
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[Proxy] ${req.method} ${req.url} -> http://localhost:8000${req.url}`);
  },
  onError: (err, req, res) => {
    console.error('[Proxy Error]:', err.message);
    res.status(500).json({ 
      error: 'FastAPI backend connection failed. Make sure FastAPI is running on port 8000.',
      detail: err.message 
    });
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
  setupWebSocket(server);

  // Mock data simulator disabled - using real database
  // const simulator = createDataSimulator(broadcast);
  // simulator.start();

  // Cleanup on server shutdown
  // process.on('SIGINT', () => {
  //   simulator.stop();
  //   process.exit();
  // });

  // Node.js routes disabled - using FastAPI backend on port 8000
  // registerRoutes(app);

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