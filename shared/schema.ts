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
  receiver_user_id: integer("receiver_user_id").references(() => users.UserID).notNull(),
  prime_activated_by_user_id: integer("prime_activated_by_user_id").references(() => users.UserID).notNull(),
  receiver_member: varchar("receiver_member", { length: 255 }),
  prime_activated_by_member: varchar("prime_activated_by_member", { length: 255 }),
  amount: decimal("amount", { precision: 10, scale: 5 }),
  package_amount: decimal("package_amount", { precision: 10, scale: 5 }),
  reference_id: varchar("reference_id", { length: 255 }),
  received_date: timestamp("received_date", { withTimezone: true }).defaultNow(),
});

export type DirectIncome = typeof directIncome.$inferSelect;

export const levelIncome = pgTable("level_income", {
  id: serial("id").primaryKey(),
  receiver_user_id: integer("receiver_user_id").references(() => users.UserID).notNull(),
  prime_activated_by_user_id: integer("prime_activated_by_user_id").references(() => users.UserID).notNull(),
  receiver_member: varchar("receiver_member", { length: 255 }),
  prime_activated_by_member: varchar("prime_activated_by_member", { length: 255 }),
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

// ============================= LOAN APPLICATIONS =============================
export const autoLoan = pgTable("auto_loan_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  vehicle_type: varchar("vehicle_type", { length: 10 }).notNull(),
  vehicle_value: decimal("vehicle_value", { precision: 10, scale: 2 }).notNull(),
  emis_paid: integer("emis_paid"),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type AutoLoan = typeof autoLoan.$inferSelect;

export const businessLoan = pgTable("business_loan_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  business_name: varchar("business_name", { length: 100 }).notNull(),
  business_type: varchar("business_type", { length: 100 }).notNull(),
  annual_turnover: decimal("annual_turnover", { precision: 12, scale: 2 }).notNull(),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  collateral_value: decimal("collateral_value", { precision: 12, scale: 2 }).notNull(),
  business_continuity: integer("business_continuity").notNull(),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type BusinessLoan = typeof businessLoan.$inferSelect;

export const homeLoan = pgTable("home_loan_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  property_value: decimal("property_value", { precision: 12, scale: 2 }).notNull(),
  income_continuity: varchar("income_continuity", { length: 100 }).notNull(),
  employment_status: varchar("employment_status", { length: 50 }).notNull(),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type HomeLoan = typeof homeLoan.$inferSelect;

export const loanAgainstProperty = pgTable("loan_against_property_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  property_value: decimal("property_value", { precision: 12, scale: 2 }).notNull(),
  income_continuity: varchar("income_continuity", { length: 100 }).notNull(),
  employment_status: varchar("employment_status", { length: 50 }).notNull(),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type LoanAgainstProperty = typeof loanAgainstProperty.$inferSelect;

export const machineLoan = pgTable("machine_loan_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  business_name: varchar("business_name", { length: 100 }).notNull(),
  machine_type: varchar("machine_type", { length: 100 }).notNull(),
  machine_cost: decimal("machine_cost", { precision: 12, scale: 2 }).notNull(),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  business_continuity: integer("business_continuity").notNull(),
  co_applicant: varchar("co_applicant", { length: 100 }),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MachineLoan = typeof machineLoan.$inferSelect;

export const personalLoan = pgTable("personal_loan_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  employment_status: varchar("employment_status", { length: 20 }).notNull(),
  company_name: varchar("company_name", { length: 100 }),
  monthly_income: decimal("monthly_income", { precision: 12, scale: 2 }).notNull(),
  existing_emis: decimal("existing_emis", { precision: 12, scale: 2 }),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  tenure: integer("tenure").notNull(),
  cibil_score: integer("cibil_score").notNull(),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type PersonalLoan = typeof personalLoan.$inferSelect;

export const privateFunding = pgTable("private_funding_applications", {
  id: serial("id").primaryKey(),
  full_name: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone_number: varchar("phone_number", { length: 15 }).notNull(),
  loan_amount: decimal("loan_amount", { precision: 12, scale: 2 }).notNull(),
  annual_turnover: decimal("annual_turnover", { precision: 12, scale: 2 }).notNull(),
  employment_type: varchar("employment_type", { length: 10 }).notNull(),
  funding_purpose: varchar("funding_purpose", { length: 255 }).notNull(),
  user_mobile: varchar("user_mobile", { length: 15 }).notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type PrivateFunding = typeof privateFunding.$inferSelect;

// ============================= BANNERS =============================
export const banner = pgTable("banners", {
  id: serial("id").primaryKey(),
  serial_no: integer("serial_no").notNull(),
  image_url: varchar("image_url", { length: 500 }).notNull(),
  navigation_url: varchar("navigation_url", { length: 500 }).notNull(),
  navigation_type: varchar("navigation_type", { length: 50 }).notNull(),
  valid_till: timestamp("valid_till", { withTimezone: true }).notNull(),
});

export type Banner = typeof banner.$inferSelect;

// ============================= DEVICES =============================
export const device = pgTable("device", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.UserID).notNull(),
  token: varchar("token", { length: 255 }).unique().notNull(),
  platform: varchar("platform", { length: 16 }).default("android"),
  app_version: varchar("app_version", { length: 32 }),
  is_active: boolean("is_active").default(true).notNull(),
  last_seen: timestamp("last_seen", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type Device = typeof device.$inferSelect;

// ============================= SERVICE REGISTRATION =============================
export const serviceRegistration = pgTable("service_registration", {
  id: serial("id").primaryKey(),
  mobile: varchar("mobile", { length: 15 }).notNull(),
  service_type: varchar("service_type", { length: 100 }).notNull(),
  registered_at: timestamp("registered_at", { withTimezone: true }).defaultNow(),
});

export type ServiceRegistration = typeof serviceRegistration.$inferSelect;

// ============================= SERVICE REQUEST =============================
export const serviceRequest = pgTable("service_request", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").references(() => users.UserID).notNull(),
  service_type: varchar("service_type", { length: 30 }).notNull(),
  operator_code: varchar("operator_code", { length: 50 }),
  mobile_number: varchar("mobile_number", { length: 20 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  reference_id: varchar("reference_id", { length: 30 }).unique().notNull(),
  status: varchar("status", { length: 15 }).default("pending").notNull(),
  payment_txn_id: varchar("payment_txn_id", { length: 50 }),
  utr_no: varchar("utr_no", { length: 50 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type ServiceRequest = typeof serviceRequest.$inferSelect;

// ============================= PAYMENT GATEWAY =============================
export const paymentGateway = pgTable("payment_gateway", {
  id: serial("id").primaryKey(),
  service_request_id: integer("service_request_id").references(() => serviceRequest.id),
  payer_name: varchar("payer_name", { length: 255 }),
  payer_email: varchar("payer_email", { length: 255 }),
  payer_mobile: varchar("payer_mobile", { length: 20 }).notNull(),
  client_txn_id: varchar("client_txn_id", { length: 50 }).unique().notNull(),
  sabpaisa_txn_id: varchar("sabpaisa_txn_id", { length: 50 }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paid_amount: decimal("paid_amount", { precision: 10, scale: 2 }),
  payment_mode: varchar("payment_mode", { length: 20 }),
  bank_name: varchar("bank_name", { length: 50 }),
  rrn: varchar("rrn", { length: 50 }),
  purpose: varchar("purpose", { length: 50 }),
  status: varchar("status", { length: 20 }).default("PENDING").notNull(),
  status_code: varchar("status_code", { length: 10 }),
  sabpaisa_message: varchar("sabpaisa_message", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type PaymentGateway = typeof paymentGateway.$inferSelect;

// ============================= SERVICE JOB LOG =============================
export const serviceJobLog = pgTable("service_job_log", {
  id: serial("id").primaryKey(),
  service_request_id: integer("service_request_id").references(() => serviceRequest.id).notNull(),
  job_type: varchar("job_type", { length: 30 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  message: varchar("message", { length: 255 }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type ServiceJobLog = typeof serviceJobLog.$inferSelect;

// ============================= SETTINGS =============================
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  Referal: boolean("Referal").default(true),
  PhoneAutoCapture: boolean("PhoneAutoCapture").default(true),
});

export type Settings = typeof settings.$inferSelect;

// ============================= AUTHENTICATION =============================
export const loginSchema = z.object({
  MobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").max(15, "Mobile number too long"),
  LoginPIN: z.string().min(4, "PIN must be at least 4 digits"),
});

export const registerSchema = z.object({
  fullname: z.string().min(2, "Name must be at least 2 characters"),
  MobileNumber: z.string().min(10, "Mobile number must be at least 10 digits").max(15, "Mobile number too long"),
  Email: z.string().email("Invalid email").optional().or(z.literal("")),
  LoginPIN: z.string().min(4, "PIN must be at least 4 digits"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
