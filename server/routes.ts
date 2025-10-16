import type { Express } from "express";

// Backend API URL (Python FastAPI)
const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:8000/api';

export function registerRoutes(app: Express) {
  // Dashboard Statistics - Proxy to Backend
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/dashboard/stats`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get Recent Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit || 10;
      const response = await fetch(`${BACKEND_API}/transactions?limit=${limit}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get All Transactions
  app.get("/api/transactions/all", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/transactions/all`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ error: "Failed to fetch all transactions" });
    }
  });

  // Get Transactions by User ID
  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      const response = await fetch(`${BACKEND_API}/transactions/user/${userId}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Failed to fetch user transactions" });
    }
  });

  // Get Recent Users
  app.get("/api/users/recent", async (req, res) => {
    try {
      const limit = req.query.limit || 10;
      const response = await fetch(`${BACKEND_API}/users/recent?limit=${limit}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      res.status(500).json({ error: "Failed to fetch recent users" });
    }
  });

  // Get All Users
  app.get("/api/users", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/users`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get User by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const response = await fetch(`${BACKEND_API}/users/${id}`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Dashboard Charts Data
  app.get("/api/dashboard/charts", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/dashboard/charts`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Proxy loan applications to the Python backend
  app.get("/api/loans/auto", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/auto`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching auto loans:", error);
      res.status(500).json({ error: "Failed to fetch auto loans" });
    }
  });

  app.get("/api/loans/business", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/business`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching business loans:", error);
      res.status(500).json({ error: "Failed to fetch business loans" });
    }
  });

  app.get("/api/loans/home", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/home`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching home loans:", error);
      res.status(500).json({ error: "Failed to fetch home loans" });
    }
  });

  app.get("/api/loans/lap", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/lap`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching LAP:", error);
      res.status(500).json({ error: "Failed to fetch loan against property" });
    }
  });

  app.get("/api/loans/machine", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/machine`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching machine loans:", error);
      res.status(500).json({ error: "Failed to fetch machine loans" });
    }
  });

  app.get("/api/loans/personal", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/personal`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching personal loans:", error);
      res.status(500).json({ error: "Failed to fetch personal loans" });
    }
  });

  app.get("/api/loans/private-funding", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/loans/private-funding`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching private funding:", error);
      res.status(500).json({ error: "Failed to fetch private funding" });
    }
  });

  // Proxy banner endpoints to the Python backend
  app.get("/api/banners", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/banners`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  // Proxy device endpoints to the Python backend
  app.get("/api/devices", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/devices`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // Proxy service endpoints to the Python backend
  app.get("/api/service-registrations", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/service-registrations`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching service registrations:", error);
      res.status(500).json({ error: "Failed to fetch service registrations" });
    }
  });

  app.get("/api/service-requests", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/service-requests`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/payment-gateway", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/payment-gateway`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  app.get("/api/service-job-logs", async (_req, res) => {
    try {
      const response = await fetch(`${BACKEND_API}/service-job-logs`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching service job logs:", error);
      res.status(500).json({ error: "Failed to fetch service job logs" });
    }
  });
}