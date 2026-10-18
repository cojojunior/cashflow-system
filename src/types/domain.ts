/**
 * Application-level enums and types that mirror the database.
 * Kept in sync manually; validated against DB by the compile step.
 */

export type PaymentMethod = "cash" | "mobile_money" | "bank_transfer" | "other";

export type AccountType = "cash" | "mobile_money" | "bank";

export type TransactionType = "income" | "expense";

export type CategoryType = "income" | "expense" | "both";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertType =
  | "low_balance"
  | "high_expense"
  | "repeated_negative_cash_flow"
  | "upcoming_planned_expense";

export type MemberRole = "owner" | "manager" | "viewer";

export type LessonLevel = "beginner" | "intermediate" | "advanced";
