import type { Express } from "express";
import {
  users, transactions, banners, devices,
  autoLoans, businessLoans, homeLoans, loanAgainstProperty,
  machineLoans, personalLoans, privateFunding,
  paymentGateway, serviceJobLogs, serviceRegistrations,
  serviceRequests, settings, pushTokens
} from "@db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Backend API URL (Python FastAPI)
const BACKEND_API = process.env.BACKEND_API_URL || 'http://localhost:8000/api';

export function registerRoutes(app: Express) {
  // Dashboard Statistics
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await db.query.users.count(); // Example: Get total users
      const transactionsCount = await db.query.transactions.count();
      const totalTransactionAmount = await db.select({
        sum: sql`SUM(${transactions.amount})`
      }).from(transactions)
      .then(result => result[0]?.sum || 0);

      const recentTransactions = await db.query.transactions.findMany({
        orderBy: desc(transactions.createdAt),
        limit: 5,
      });

      const recentUsers = await db.query.users.findMany({
        orderBy: desc(users.createdAt),
        limit: 5,
      });

      const statsData = {
        totalUsers: stats,
        totalTransactions: transactionsCount,
        totalTransactionAmount: totalTransactionAmount,
        recentTransactions: recentTransactions,
        recentUsers: recentUsers,
        // Mock data for recharges, to be replaced by actual API calls
        mobile_recharges: 4500,
        dth_recharges: 2100,
      };
      res.json(statsData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get Recent Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await db.query.transactions.findMany({
        orderBy: desc(transactions.createdAt),
        limit: limit,
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get All Transactions
  app.get("/api/transactions/all", async (_req, res) => {
    try {
      const transactions = await db.query.transactions.findMany({
        orderBy: desc(transactions.createdAt),
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ error: "Failed to fetch all transactions" });
    }
  });

  // Get Transactions by User ID
  app.get("/api/transactions/user/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const transactions = await db.query.transactions.findMany({
        where: eq(transactions.userId, userId),
        orderBy: desc(transactions.createdAt),
      });
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      res.status(500).json({ error: "Failed to fetch user transactions" });
    }
  });

  // Get Recent Users
  app.get("/api/users/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await db.query.users.findMany({
        orderBy: desc(users.createdAt),
        limit: limit,
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      res.status(500).json({ error: "Failed to fetch recent users" });
    }
  });

  // Get All Users
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await db.query.users.findMany({
        orderBy: desc(users.createdAt),
      });
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get User by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await db.query.users.findFirst({
        where: eq(users.id, id),
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Dashboard Charts Data - matching frontend format
  app.get("/api/dashboard/charts", async (_req, res) => {
    try {
      const stats = await db.query.transactions.count(); // Placeholder, replace with actual data fetching

      // Generate chart data in the format expected by frontend
      const chartData = {
        dailyVolume: [
          { name: 'Mon', transactions: 1200, amount: 245000 },
          { name: 'Tue', transactions: 1800, amount: 389000 },
          { name: 'Wed', transactions: 1500, amount: 312000 },
          { name: 'Thu', transactions: 2400, amount: 498000 },
          { name: 'Fri', transactions: 2200, amount: 456000 },
          { name: 'Sat', transactions: 3100, amount: 689000 },
          { name: 'Sun', transactions: 2900, amount: 612000 }
        ],
        serviceDistribution: [
          { name: 'Electricity', value: 35, color: '#3B82F6' },
          { name: 'Gas', value: 20, color: '#6366F1' },
          // These should ideally come from actual data if available or be dynamically calculated
          { name: 'Mobile', value: 45, color: '#10B981' },
          { name: 'DTH', value: 15, color: '#FBBF24' },
          { name: 'Water', value: 15, color: '#06B6D4' },
          { name: 'Broadband', value: 12, color: '#8B5CF6' }
        ]
      };

      res.json(chartData);
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