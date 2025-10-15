import { pgTable, serial, varchar, boolean, decimal, integer, timestamp, text } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z} from "zod";

// ============================= USERS =============================
export const users = pgTable("users", {
  UserID: serial("UserID").primaryKey(),
  fullname: varchar("fullname", { length: 255 }),
  MobileNumber: varchar("MobileNumber", { length: 15 }).notNull().unique(),
  Email: varchar("Email", { length: 255 }),
  PasswordHash: text("PasswordHash"),
  LoginPIN: varchar("LoginPIN", { length: 100 }),
  TransactionPIN: varchar("TransactionPIN", { length: 100 }),
  IsKYCCompleted: boolean("IsKYCCompleted").default(false),
  introducer_id: varchar("introducer_id", { length: 255 }),
  member_id: varchar("member_id", { length: 255 }).unique(),
  RewardWalletBalance: decimal("RewardWalletBalance", { precision: 10, scale: 5 }).default("0.00"),
  INRWalletBalance: decimal("INRWalletBalance", { precision: 10, scale: 5 }).default("0.00"),
  DeviceVerified: boolean("DeviceVerified").default(false),
  CreatedAt: timestamp("CreatedAt", { withTimezone: true }).defaultNow(),
  UpdatedAt: timestamp("UpdatedAt", { withTimezone: true }),
  DeletedAt: timestamp("DeletedAt", { withTimezone: true }),
  IsDeleted: boolean("IsDeleted").default(false),
  fingerPrintStatus: integer("fingerPrintStatus"),
  activation_status: boolean("activation_status").default(false),
  aadhar_verification_status: boolean("aadhar_verification_status").default(false),
  pan_verification_status: boolean("pan_verification_status").default(false),
  email_verification_status: boolean("email_verification_status").default(false),
  prime_status: boolean("prime_status").default(false),
  prime_activation_date: timestamp("prime_activation_date", { withTimezone: true }),
  total_packages: decimal("total_packages", { precision: 10, scale: 5 }).default("0.00"),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  UserID: true, 
  CreatedAt: true,
  UpdatedAt: true,
  DeletedAt: true 
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// ============================= TRANSACTIONS =============================
export const transactions = pgTable("transactions", {
  TransactionID: serial("TransactionID").primaryKey(),
  UserID: integer("UserID").references(() => users.UserID),
  TransactionType: varchar("TransactionType", { length: 50 }),
  Amount: decimal("Amount", { precision: 10, scale: 5 }),
  Status: varchar("Status", { length: 50 }),
  TransactionPIN: varchar("TransactionPIN", { length: 10 }),
  CreatedAt: timestamp("CreatedAt", { withTimezone: true }).defaultNow(),
  DeletedAt: timestamp("DeletedAt", { withTimezone: true }),
  IsDeleted: boolean("IsDeleted").default(false),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({ 
  TransactionID: true,
  CreatedAt: true,
  DeletedAt: true 
});
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// ============================= WALLET =============================
export const wallet = pgTable("wallet", {
  id: serial("id").primaryKey(),
  transaction_by: integer("transaction_by").references(() => users.UserID),
  reference_id: varchar("reference_id", { length: 255 }).notNull(),
  transaction_amount: decimal("transaction_amount", { precision: 10, scale: 5 }).default("0.00000"),
  transaction_type: varchar("transaction_type", { length: 50 }),
  purpose: varchar("purpose", { length: 255 }),
  remark: varchar("remark", { length: 255 }).default(""),
  transaction_date: timestamp("transaction_date", { withTimezone: true }).defaultNow(),
  transaction_mode: varchar("transaction_mode", { length: 50 }).default("online"),
  utr_no: varchar("utr_no", { length: 255 }).unique(),
  status: varchar("status", { length: 50 }).default("pending"),
  payment_screenshot: varchar("payment_screenshot", { length: 500 }),
});

export const insertWalletSchema = createInsertSchema(wallet).omit({ 
  id: true,
  transaction_date: true 
});
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallet.$inferSelect;

// ============================= INCOME TABLES =============================
export const directIncome = pgTable("direct_income", {
  id: serial("id").primaryKey(),
  receiver_member: varchar("receiver_member", { length: 255 }).notNull(),
  prime_activated_by_member: varchar("prime_activated_by_member", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 5 }),
  package_amount: decimal("package_amount", { precision: 10, scale: 5 }),
  reference_id: varchar("reference_id", { length: 255 }),
  received_date: timestamp("received_date", { withTimezone: true }).defaultNow(),
});

export type DirectIncome = typeof directIncome.$inferSelect;

export const levelIncome = pgTable("level_income", {
  id: serial("id").primaryKey(),
  receiver_member: varchar("receiver_member", { length: 255 }).notNull(),
  prime_activated_by_member: varchar("prime_activated_by_member", { length: 255 }).notNull(),
  level: integer("level"),
  amount: decimal("amount", { precision: 10, scale: 5 }),
  package_amount: decimal("package_amount", { precision: 10, scale: 5 }),
  reference_id: varchar("reference_id", { length: 255 }),
  received_date: timestamp("received_date", { withTimezone: true }).defaultNow(),
});

export type LevelIncome = typeof levelIncome.$inferSelect;

// ============================= PROFILE / KYC =============================
export const userProfile = pgTable("userprofile", {
  ProfileID: serial("ProfileID").primaryKey(),
  UserID: integer("UserID").references(() => users.UserID).notNull(),
  FullName: varchar("FullName", { length: 255 }),
  AadhaarNumber: varchar("AadhaarNumber", { length: 12 }),
  PANNumber: varchar("PANNumber", { length: 10 }),
  UploadedDocuments: text("UploadedDocuments"),
  EmailVerified: boolean("EmailVerified").default(false),
  KYCLevel: integer("KYCLevel").default(0),
  TransferLimit: decimal("TransferLimit", { precision: 10, scale: 2 }),
  CreatedAt: timestamp("CreatedAt", { withTimezone: true }).defaultNow(),
  DeletedAt: timestamp("DeletedAt", { withTimezone: true }),
  IsDeleted: boolean("IsDeleted").default(false),
});

export type UserProfile = typeof userProfile.$inferSelect;

export const memberships = pgTable("memberships", {
  MembershipID: serial("MembershipID").primaryKey(),
  UserID: integer("UserID").references(() => users.UserID),
  Plan: varchar("Plan", { length: 255 }),
  StartDate: timestamp("StartDate", { withTimezone: true }).defaultNow(),
  EndDate: timestamp("EndDate", { withTimezone: true }),
  Status: varchar("Status", { length: 50 }),
  CreatedAt: timestamp("CreatedAt", { withTimezone: true }).defaultNow(),
  DeletedAt: timestamp("DeletedAt", { withTimezone: true }),
  IsDeleted: boolean("IsDeleted").default(false),
});

export type Membership = typeof memberships.$inferSelect;

// ============================= P2P TRANSACTIONS =============================
export const p2pTransaction = pgTable("p2p_transaction", {
  id: serial("id").primaryKey(),
  transaction_from: integer("transaction_from").references(() => users.UserID),
  transaction_to: integer("transaction_to").references(() => users.UserID),
  reference_id: varchar("reference_id", { length: 255 }).notNull().unique(),
  transaction_amount: decimal("transaction_amount", { precision: 10, scale: 5 }),
  transaction_type: varchar("transaction_type", { length: 10 }),
  transaction_date: timestamp("transaction_date", { withTimezone: true }).defaultNow(),
  status: varchar("status", { length: 15 }).default("pending"),
});

export type P2PTransaction = typeof p2pTransaction.$inferSelect;
