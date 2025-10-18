import type { Express } from "express";
import { MemStorage } from "./storage";
import { createAccessToken, authMiddleware } from "./auth";
import { loginSchema, registerSchema } from "@shared/schema";

const storage = new MemStorage();

export function registerRoutes(app: Express) {
  // Authentication Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validation = registerSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { MobileNumber, LoginPIN, fullname, Email } = validation.data;

      // Check if user already exists
      const existingUser = await storage.getUserByMobile(MobileNumber);
      if (existingUser) {
        return res.status(400).json({ error: "Mobile number already registered" });
      }

      // Create new user
      const newUser = await storage.createUser({
        fullname,
        MobileNumber,
        Email: Email || undefined,
        LoginPIN,
      });

      const accessToken = createAccessToken(newUser.UserID, newUser.MobileNumber);

      res.status(201).json({
        access_token: accessToken,
        token_type: "bearer",
        user: {
          id: newUser.UserID,
          fullname: newUser.fullname,
          MobileNumber: newUser.MobileNumber,
        }
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.issues[0].message });
      }

      const { MobileNumber, LoginPIN } = validation.data;

      // Get user by mobile number
      const user = await storage.getUserByMobile(MobileNumber);
      
      if (!user || user.LoginPIN !== LoginPIN) {
        return res.status(401).json({ error: "Invalid mobile number or PIN" });
      }

      const accessToken = createAccessToken(user.UserID, user.MobileNumber);

      res.json({
        access_token: accessToken,
        token_type: "bearer",
        user: {
          id: user.UserID,
          fullname: user.fullname,
          MobileNumber: user.MobileNumber,
          Email: user.Email,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/auth/verify", authMiddleware, async (req, res) => {
    try {
      const userId = (req as any).user.userId;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        valid: true,
        user: {
          id: user.UserID,
          fullname: user.fullname,
          MobileNumber: user.MobileNumber,
          Email: user.Email,
        }
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", authMiddleware, async (_req, res) => {
    try {
      res.json({ message: "Successfully logged out" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // User Management Endpoints
  app.get("/api/v1/users/all", authMiddleware, async (req, res) => {
    try {
      const userType = req.query.user_type as string;
      const verificationStatus = req.query.verification_status as string;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

      let users = await storage.getAllUsers();

      // Add computed fields
      users = users.map((user: any) => ({
        ...user,
        userType: user.prime_status ? 'Prime User' : 'Normal User',
        verification_status: user.aadhar_verification_status && user.pan_verification_status 
          ? 'Verified' 
          : user.aadhar_verification_status || user.pan_verification_status 
            ? 'Partial Verified' 
            : 'Not Verified'
      }));

      // Filter by user type
      if (userType && userType !== 'All') {
        users = users.filter((u: any) => u.userType === userType);
      }

      // Filter by verification status
      if (verificationStatus && verificationStatus !== 'All') {
        users = users.filter((u: any) => u.verification_status === verificationStatus);
      }

      // Apply limit
      users = users.slice(0, limit);

      res.json(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/v1/users/detail/:id", authMiddleware, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Add computed fields
      const userWithDetails = {
        ...user,
        userType: user.prime_status ? 'Prime User' : 'Normal User',
        verification_status: user.aadhar_verification_status && user.pan_verification_status 
          ? 'Verified' 
          : user.aadhar_verification_status || user.pan_verification_status 
            ? 'Partial Verified' 
            : 'Not Verified',
        aadhaar: user.aadhar_verification_status ? {
          aadharNumber: "XXXX-XXXX-" + (Math.floor(Math.random() * 9000) + 1000),
          dateOfBirth: "1990-01-01",
          gender: "Male",
          address: {
            house: "123",
            street: "Main Street",
            locality: "Downtown",
            district: "Central",
            state: "Maharashtra",
            pin: "400001"
          },
          photo: "https://via.placeholder.com/400x300?text=Aadhaar+Photo"
        } : null,
        pan: user.pan_verification_status ? {
          pan_number: "ABCDE" + (Math.floor(Math.random() * 9000) + 1000) + "F",
          pan_holder_name: user.fullname,
          category: "Individual",
          pan_image: "https://via.placeholder.com/400x300?text=PAN+Card"
        } : null
      };

      res.json(userWithDetails);
    } catch (error) {
      console.error("Error fetching user detail:", error);
      res.status(500).json({ error: "Failed to fetch user detail" });
    }
  });

  // Dashboard Statistics
  app.get("/api/dashboard/stats", authMiddleware, async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Dashboard Charts Data
  app.get("/api/dashboard/charts", authMiddleware, async (_req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Get Recent Users for Dashboard
  app.get("/api/dashboard/users/recent", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const users = await storage.getRecentUsers(limit);
      res.json(users);
    } catch (error) {
      console.error("Error fetching recent users:", error);
      res.status(500).json({ error: "Failed to fetch recent users" });
    }
  });

  // Get Recent Transactions for Dashboard
  app.get("/api/dashboard/transactions", authMiddleware, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const transactions = await storage.getRecentTransactions(limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching dashboard transactions:", error);
      res.status(500).json({ error: "Failed to fetch dashboard transactions" });
    }
  });

  // Get Recent Transactions
  app.get("/api/transactions", authMiddleware, async (req, res) => {
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
  app.get("/api/transactions/all", authMiddleware, async (_req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching all transactions:", error);
      res.status(500).json({ error: "Failed to fetch all transactions" });
    }
  });

  // Get Transactions by User ID
  app.get("/api/transactions/user/:userId", authMiddleware, async (req, res) => {
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
  app.get("/api/users/recent", authMiddleware, async (req, res) => {
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
  app.get("/api/users", authMiddleware, async (_req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get User by ID
  app.get("/api/users/:id", authMiddleware, async (req, res) => {
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

  // Loan endpoints
  app.get("/api/loans/auto", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllAutoLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching auto loans:", error);
      res.status(500).json({ error: "Failed to fetch auto loans" });
    }
  });

  app.get("/api/loans/business", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllBusinessLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching business loans:", error);
      res.status(500).json({ error: "Failed to fetch business loans" });
    }
  });

  app.get("/api/loans/home", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllHomeLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching home loans:", error);
      res.status(500).json({ error: "Failed to fetch home loans" });
    }
  });

  app.get("/api/loans/lap", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllLoanAgainstProperty();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching LAP:", error);
      res.status(500).json({ error: "Failed to fetch loan against property" });
    }
  });

  app.get("/api/loans/machine", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllMachineLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching machine loans:", error);
      res.status(500).json({ error: "Failed to fetch machine loans" });
    }
  });

  app.get("/api/loans/personal", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllPersonalLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching personal loans:", error);
      res.status(500).json({ error: "Failed to fetch personal loans" });
    }
  });

  app.get("/api/loans/private-funding", authMiddleware, async (_req, res) => {
    try {
      const loans = await storage.getAllPrivateFunding();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching private funding:", error);
      res.status(500).json({ error: "Failed to fetch private funding" });
    }
  });

  // Banner endpoints
  app.get("/api/banners", authMiddleware, async (_req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  // Device endpoints
  app.get("/api/devices", authMiddleware, async (_req, res) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // Service endpoints
  app.get("/api/service-registrations", authMiddleware, async (_req, res) => {
    try {
      const registrations = await storage.getAllServiceRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching service registrations:", error);
      res.status(500).json({ error: "Failed to fetch service registrations" });
    }
  });

  app.get("/api/service-requests", authMiddleware, async (_req, res) => {
    try {
      const requests = await storage.getAllServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/payment-gateway", authMiddleware, async (_req, res) => {
    try {
      const payments = await storage.getAllPaymentGateway();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  app.get("/api/service-job-logs", authMiddleware, async (_req, res) => {
    try {
      const logs = await storage.getAllServiceJobLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching service job logs:", error);
      res.status(500).json({ error: "Failed to fetch service job logs" });
    }
  });
}
