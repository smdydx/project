import { type Express } from "express";
import { MemStorage } from "./storage";

export function registerRoutes(app: Express) {
  const storage = new MemStorage();

  // API routes will be added here as needed
}
