import { type Express } from "express";
import { MemStorage } from "./storage";

export function registerRoutes(app: Express) {
  const storage = new MemStorage();

  // Dashboard Statistics
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Get Recent Transactions
  app.get("/api/transactions", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  // Get All Transactions
  app.get("/api/transactions/all", async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
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
      const transactions = await storage.getTransactionsByUserId(userId);
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
      const users = await storage.getRecentUsers(limit);
      res.json(users);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      res.status(500).json({ error: "Failed to fetch recent users" });
    }
  });

  // Get All Users
  app.get("/api/users", async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
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
      const user = await storage.getUserById(id);
      
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
      const stats = await storage.getDashboardStats();
      
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
          { name: 'Mobile', value: stats.mobile_recharges, color: '#10B981' },
          { name: 'DTH', value: stats.dth_recharges, color: '#FBBF24' },
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
}
