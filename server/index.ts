import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { setupWebSocket } from "./websocket";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

  // Example: Broadcast to channels periodically (you can call this from your routes)
  setInterval(() => {
    // Simulate real-time user registrations
    const newUser = {
      id: `USR${Math.floor(Math.random() * 100000)}`,
      name: 'John Doe',
      email: 'user@example.com',
      timestamp: new Date().toISOString()
    };
    broadcast('user-registrations', newUser);

    // Simulate real-time transactions
    const newTransaction = {
      id: `TXN${Math.floor(Math.random() * 100000)}`,
      amount: Math.floor(Math.random() * 10000),
      status: 'Success',
      timestamp: new Date().toISOString()
    };
    broadcast('transactions', newTransaction);
  }, 5000);

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
