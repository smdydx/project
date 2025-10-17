import type { Express } from "express";
import jwt from "jsonwebtoken";
import { MemStorage } from "./storage";

const storage = new MemStorage();

// JWT Configuration
const SECRET_KEY = process.env.JWT_SECRET || "lcrpay-secret-key-change-in-production-2024";
const ALGORITHM = "HS256";
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;
const REFRESH_TOKEN_EXPIRE_DAYS = 7;

// Admin credentials
const ADMIN_USERNAME = "LCRadmin";
const ADMIN_PASSWORD = "admin123smdydx1216";

// JWT Helper Functions
function createAccessToken(username: string): string {
  const payload = {
    username,
    token_type: "access",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (ACCESS_TOKEN_EXPIRE_MINUTES * 60)
  };
  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM as jwt.Algorithm });
}

function createRefreshToken(username: string): string {
  const payload = {
    username,
    token_type: "refresh",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)
  };
  return jwt.sign(payload, SECRET_KEY, { algorithm: ALGORITHM as jwt.Algorithm });
}

function verifyToken(token: string, expectedType: string = "access"): { username: string; token_type: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY, { algorithms: [ALGORITHM as jwt.Algorithm] }) as any;
    if (decoded.token_type !== expectedType) {
      return null;
    }
    return { username: decoded.username, token_type: decoded.token_type };
  } catch (error) {
    return null;
  }
}

export function registerRoutes(app: Express) {
  // Authentication Routes
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ detail: "Username and password are required" });
      }

      // Authenticate user
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        return res.status(401).json({ detail: "Incorrect username or password" });
      }

      // Create tokens
      const accessToken = createAccessToken(username);
      const refreshToken = createRefreshToken(username);

      res.json({
        access_token: accessToken,
        refresh_token: refreshToken,
        token_type: "bearer",
        username: username,
        expires_in: ACCESS_TOKEN_EXPIRE_MINUTES * 60
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  app.post("/api/v1/auth/refresh", async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({ detail: "Refresh token is required" });
      }

      const tokenData = verifyToken(refresh_token, "refresh");
      if (!tokenData) {
        return res.status(401).json({ detail: "Invalid refresh token" });
      }

      const newAccessToken = createAccessToken(tokenData.username);

      res.json({
        access_token: newAccessToken,
        token_type: "bearer",
        expires_in: ACCESS_TOKEN_EXPIRE_MINUTES * 60
      });
    } catch (error) {
      console.error("Token refresh error:", error);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  app.get("/api/v1/auth/verify", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ detail: "Missing or invalid authorization header" });
      }

      const token = authHeader.substring(7);
      const tokenData = verifyToken(token, "access");

      if (!tokenData) {
        return res.status(401).json({ detail: "Invalid or expired token" });
      }

      res.json({
        valid: true,
        username: tokenData.username
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  app.post("/api/v1/auth/logout", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ detail: "Missing or invalid authorization header" });
      }

      const token = authHeader.substring(7);
      const tokenData = verifyToken(token, "access");

      if (!tokenData) {
        return res.status(401).json({ detail: "Invalid or expired token" });
      }

      res.json({
        message: "Successfully logged out",
        username: tokenData.username
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ detail: "Internal server error" });
    }
  });

  // User Management Endpoints
  app.get("/api/v1/users/all", async (req, res) => {
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

  app.get("/api/v1/users/detail/:id", async (req, res) => {
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
  app.get("/api/dashboard/stats", async (_req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Dashboard Charts Data
  app.get("/api/dashboard/charts", async (_req, res) => {
    try {
      const chartData = await storage.getChartData();
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
      res.status(500).json({ error: "Failed to fetch chart data" });
    }
  });

  // Get Recent Users for Dashboard
  app.get("/api/dashboard/users/recent", async (req, res) => {
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
  app.get("/api/dashboard/transactions", async (req, res) => {
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

  // Loan endpoints
  app.get("/api/loans/auto", async (_req, res) => {
    try {
      const loans = await storage.getAllAutoLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching auto loans:", error);
      res.status(500).json({ error: "Failed to fetch auto loans" });
    }
  });

  app.get("/api/loans/business", async (_req, res) => {
    try {
      const loans = await storage.getAllBusinessLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching business loans:", error);
      res.status(500).json({ error: "Failed to fetch business loans" });
    }
  });

  app.get("/api/loans/home", async (_req, res) => {
    try {
      const loans = await storage.getAllHomeLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching home loans:", error);
      res.status(500).json({ error: "Failed to fetch home loans" });
    }
  });

  app.get("/api/loans/lap", async (_req, res) => {
    try {
      const loans = await storage.getAllLoanAgainstProperty();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching LAP:", error);
      res.status(500).json({ error: "Failed to fetch loan against property" });
    }
  });

  app.get("/api/loans/machine", async (_req, res) => {
    try {
      const loans = await storage.getAllMachineLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching machine loans:", error);
      res.status(500).json({ error: "Failed to fetch machine loans" });
    }
  });

  app.get("/api/loans/personal", async (_req, res) => {
    try {
      const loans = await storage.getAllPersonalLoans();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching personal loans:", error);
      res.status(500).json({ error: "Failed to fetch personal loans" });
    }
  });

  app.get("/api/loans/private-funding", async (_req, res) => {
    try {
      const loans = await storage.getAllPrivateFunding();
      res.json(loans);
    } catch (error) {
      console.error("Error fetching private funding:", error);
      res.status(500).json({ error: "Failed to fetch private funding" });
    }
  });

  // Banner endpoints
  app.get("/api/banners", async (_req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  // Device endpoints
  app.get("/api/devices", async (_req, res) => {
    try {
      const devices = await storage.getAllDevices();
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ error: "Failed to fetch devices" });
    }
  });

  // Service endpoints
  app.get("/api/service-registrations", async (_req, res) => {
    try {
      const registrations = await storage.getAllServiceRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching service registrations:", error);
      res.status(500).json({ error: "Failed to fetch service registrations" });
    }
  });

  app.get("/api/service-requests", async (_req, res) => {
    try {
      const requests = await storage.getAllServiceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      res.status(500).json({ error: "Failed to fetch service requests" });
    }
  });

  app.get("/api/payment-gateway", async (_req, res) => {
    try {
      const payments = await storage.getAllPaymentGateway();
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ error: "Failed to fetch payment gateway" });
    }
  });

  app.get("/api/service-job-logs", async (_req, res) => {
    try {
      const logs = await storage.getAllServiceJobLogs();
      res.json(logs);
    } catch (error) {
      console.error("Error fetching service job logs:", error);
      res.status(500).json({ error: "Failed to fetch service job logs" });
    }
  });
}
