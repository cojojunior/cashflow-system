export interface CategorySeed {
  name: string;
  slug: string;
  type: "income" | "expense" | "both";
  icon: string;
}

/** Default categories seeded on business creation */
export const DEFAULT_INCOME_CATEGORIES: CategorySeed[] = [
  { name: "Sales", slug: "sales", type: "income", icon: "ShoppingBag" },
  { name: "Services", slug: "services", type: "income", icon: "Briefcase" },
  { name: "Other Income", slug: "other-income", type: "income", icon: "Plus" },
];

export const DEFAULT_EXPENSE_CATEGORIES: CategorySeed[] = [
  { name: "Stock Purchase", slug: "stock", type: "expense", icon: "Package" },
  { name: "Transport", slug: "transport", type: "expense", icon: "Truck" },
  { name: "Rent", slug: "rent", type: "expense", icon: "Home" },
  { name: "Utilities", slug: "utilities", type: "expense", icon: "Zap" },
  { name: "Wages", slug: "wages", type: "expense", icon: "Users" },
  { name: "Food", slug: "food", type: "expense", icon: "UtensilsCrossed" },
  { name: "Maintenance", slug: "maintenance", type: "expense", icon: "Wrench" },
  { name: "Other", slug: "other", type: "expense", icon: "MoreHorizontal" },
];

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "mobile_money", label: "Mobile Money" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "other", label: "Other" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];
