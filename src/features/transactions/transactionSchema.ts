import { z } from "zod";
import { PAYMENT_METHODS } from "@/constants/categories";

// Extract the exact union type from the const array
const paymentMethodValues = PAYMENT_METHODS.map((m) => m.value) as [
  "cash",
  "mobile_money",
  "bank_transfer",
  "other",
];

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than zero"),
  occurred_on: z.string().min(1, "Date is required"),
  category_id: z.string().uuid("Please select a category"),
  account_id: z.string().uuid("Please select an account"),
  payment_method: z.enum(paymentMethodValues),
  description: z.string().min(2, "Description is required"),
  customer_reference: z.string().optional(),
  notes: z.string().optional(),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;
