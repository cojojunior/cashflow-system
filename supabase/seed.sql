-- =====================================================================
-- SME CashFlow Manager — Initial Schema
-- =====================================================================
-- Design principles:
--   * Every business-owned record has business_id (RLS anchor)
--   * Money stored as NUMERIC(15,2) — never floating point
--   * UUID primary keys, created_at / updated_at timestamps
--   * Triggers keep updated_at fresh and validate ownership chains
--   * RLS enforced on every table
--   * Transfers are their own entity — never income/expense
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- text search on transactions

-- ---------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------
create type payment_method as enum ('cash', 'mobile_money', 'bank_transfer', 'other');
create type account_type as enum ('cash', 'mobile_money', 'bank');
create type transaction_type as enum ('income', 'expense');
create type category_type as enum ('income', 'expense', 'both');
create type alert_severity as enum ('info', 'warning', 'critical');
create type alert_type as enum (
  'low_balance',
  'high_expense',
  'repeated_negative_cash_flow',
  'upcoming_planned_expense'
);
create type alert_status as enum ('active', 'dismissed', 'resolved');
create type member_role as enum ('owner', 'manager', 'viewer');
create type lesson_level as enum ('beginner', 'intermediate', 'advanced');
create type transfer_status as enum ('completed', 'reversed');
create type adjustment_reason as enum ('opening_balance', 'reconciliation', 'correction', 'other');

-- ---------------------------------------------------------------------
-- 2. updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. profiles
--    Mirrors auth.users with lightweight app data.
--    Created automatically on user signup via trigger (see section 15).
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  timezone text not null default 'Africa/Accra',
  locale text not null default 'en-GH',
  avatar_url text,
  onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 4. businesses
--    A user can own/manage multiple businesses (schema allows it).
--    Phase 2–4 UI uses the first business; switcher comes later.
-- ---------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references profiles(id) on delete restrict,
  business_type text,
  location text,
  currency text not null default 'GHS',
  safe_cash_threshold numeric(15,2) not null default 0,
  timezone text not null default 'Africa/Accra',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint businesses_safe_threshold_nonneg check (safe_cash_threshold >= 0)
);
create index businesses_owner_idx on businesses(owner_id);
create trigger trg_businesses_updated_at before update on businesses
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 5. business_members
--    Role-based access. Owner is added automatically by trigger.
-- ---------------------------------------------------------------------
create table business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role member_role not null default 'viewer',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);
create index business_members_user_idx on business_members(user_id);
create index business_members_business_idx on business_members(business_id);

-- ---------------------------------------------------------------------
-- 6. Helper functions for RLS
--    SECURITY DEFINER avoids recursive RLS evaluation on business_members.
-- ---------------------------------------------------------------------
create or replace function is_business_member(p_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from business_members
    where business_id = p_business_id and user_id = auth.uid()
  );
$$;

create or replace function is_business_owner(p_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from business_members
    where business_id = p_business_id and user_id = auth.uid() and role = 'owner'
  );
$$;

create or replace function can_write_business(p_business_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from business_members
    where business_id = p_business_id
      and user_id = auth.uid()
      and role in ('owner', 'manager')
  );
$$;

-- ---------------------------------------------------------------------
-- 7. financial_accounts
--    Cash, Mobile Money, Bank — each one is a real tracked wallet.
-- ---------------------------------------------------------------------
create table financial_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  type account_type not null,
  currency text not null default 'GHS',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index financial_accounts_business_idx on financial_accounts(business_id);
create trigger trg_financial_accounts_updated_at before update on financial_accounts
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 8. transaction_categories
-- ---------------------------------------------------------------------
create table transaction_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  slug text not null,
  type category_type not null,
  icon text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, slug, type)
);
create index transaction_categories_business_idx on transaction_categories(business_id);
create trigger trg_transaction_categories_updated_at before update on transaction_categories
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 9. transactions
--    income or expense. Never a transfer.
-- ---------------------------------------------------------------------
create table transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  account_id uuid not null references financial_accounts(id) on delete restrict,
  category_id uuid references transaction_categories(id) on delete set null,
  type transaction_type not null,
  amount numeric(15,2) not null,
  occurred_on date not null,
  description text,
  customer_reference text,
  payment_method payment_method not null default 'cash',
  notes text,
  receipt_url text,
  created_by uuid references profiles(id) on delete set null,
  is_reversed boolean not null default false,
  reversed_transaction_id uuid references transactions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transactions_amount_positive check (amount > 0)
);
create index transactions_business_date_idx on transactions(business_id, occurred_on desc);
create index transactions_account_idx on transactions(account_id);
create index transactions_category_idx on transactions(category_id);
create index transactions_type_idx on transactions(business_id, type);
-- Full-text-ish search on description
create index transactions_description_trgm_idx on transactions using gin (description gin_trgm_ops);
create trigger trg_transactions_updated_at before update on transactions
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 10. account_transfers
--     Never counted as income/expense. Only shifts between accounts.
-- ---------------------------------------------------------------------
create table account_transfers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  from_account_id uuid not null references financial_accounts(id) on delete restrict,
  to_account_id uuid not null references financial_accounts(id) on delete restrict,
  amount numeric(15,2) not null,
  occurred_on date not null,
  description text,
  status transfer_status not null default 'completed',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfers_amount_positive check (amount > 0),
  constraint transfers_distinct_accounts check (from_account_id <> to_account_id)
);
create index transfers_business_date_idx on account_transfers(business_id, occurred_on desc);
create index transfers_from_idx on account_transfers(from_account_id);
create index transfers_to_idx on account_transfers(to_account_id);
create trigger trg_transfers_updated_at before update on account_transfers
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 11. cash_adjustments
--     Opening balances, reconciliations, manual corrections.
--     NOT counted as income or expenses — these adjust the base.
-- ---------------------------------------------------------------------
create table cash_adjustments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  account_id uuid not null references financial_accounts(id) on delete restrict,
  amount numeric(15,2) not null,   -- can be negative (a shortfall)
  occurred_on date not null,
  reason adjustment_reason not null,
  note text,
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index cash_adj_business_date_idx on cash_adjustments(business_id, occurred_on desc);
create index cash_adj_account_idx on cash_adjustments(account_id);

-- ---------------------------------------------------------------------
-- 12. budgets
-- ---------------------------------------------------------------------
create table budgets (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  category_id uuid references transaction_categories(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  limit_amount numeric(15,2) not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint budgets_limit_positive check (limit_amount > 0),
  constraint budgets_period_valid check (period_end >= period_start)
);
create index budgets_business_idx on budgets(business_id);
create trigger trg_budgets_updated_at before update on budgets
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 13. planned_expenses
-- ---------------------------------------------------------------------
create table planned_expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  amount numeric(15,2) not null,
  due_on date not null,
  category_id uuid references transaction_categories(id) on delete set null,
  note text,
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planned_amount_positive check (amount > 0)
);
create index planned_business_due_idx on planned_expenses(business_id, due_on);
create trigger trg_planned_expenses_updated_at before update on planned_expenses
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 14. cash_alerts
-- ---------------------------------------------------------------------
create table cash_alerts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  alert_type alert_type not null,
  severity alert_severity not null,
  title text not null,
  message text not null,
  metadata jsonb,
  status alert_status not null default 'active',
  triggered_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index alerts_business_status_idx on cash_alerts(business_id, status);

-- ---------------------------------------------------------------------
-- 15. financial_lessons (platform content, not business-owned)
-- ---------------------------------------------------------------------
create table financial_lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  content text not null,     -- markdown body
  level lesson_level not null default 'beginner',
  topics text[] not null default '{}',
  estimated_minutes int not null default 5,
  ghs_example text,
  display_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_financial_lessons_updated_at before update on financial_lessons
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- 16. lesson_progress
-- ---------------------------------------------------------------------
create table lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references financial_lessons(id) on delete cascade,
  completed_at timestamptz,
  last_viewed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);
create index lesson_progress_user_idx on lesson_progress(user_id);

-- ---------------------------------------------------------------------
-- 17. quizzes & quiz_attempts
-- ---------------------------------------------------------------------
create table quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references financial_lessons(id) on delete cascade,
  question text not null,
  options jsonb not null,          -- e.g. [{"key":"a","text":"..."}, ...]
  correct_key text not null,
  explanation text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);
create index quizzes_lesson_idx on quizzes(lesson_id);

create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references financial_lessons(id) on delete cascade,
  score int not null,
  total int not null,
  answers jsonb,
  attempted_at timestamptz not null default now()
);
create index quiz_attempts_user_lesson_idx on quiz_attempts(user_id, lesson_id);

-- ---------------------------------------------------------------------
-- 18. audit_logs
--     Immutable. Auto-populated by triggers below.
-- ---------------------------------------------------------------------
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid references profiles(id) on delete set null,
  entity text not null,
  entity_id uuid,
  action text not null,       -- 'insert' | 'update' | 'delete'
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_business_idx on audit_logs(business_id, created_at desc);
create index audit_logs_entity_idx on audit_logs(entity, entity_id);

-- =====================================================================
-- Triggers — business rules
-- =====================================================================

-- ---------------------------------------------------------------------
-- 19. Auto-create profile on new auth user
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- 20. Auto-add owner as business_member when a business is created
-- ---------------------------------------------------------------------
create or replace function handle_new_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into business_members (business_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

create trigger on_business_created
  after insert on businesses
  for each row execute function handle_new_business();

-- ---------------------------------------------------------------------
-- 21. Validate transaction belongs to a business the writer can write
--     (defense in depth — RLS also enforces this)
-- ---------------------------------------------------------------------
create or replace function validate_transaction_business()
returns trigger
language plpgsql
as $$
begin
  -- account must belong to the same business
  if not exists (
    select 1 from financial_accounts
    where id = new.account_id and business_id = new.business_id
  ) then
    raise exception 'account_id % does not belong to business %', new.account_id, new.business_id;
  end if;

  -- category (if set) must belong to same business
  if new.category_id is not null and not exists (
    select 1 from transaction_categories
    where id = new.category_id and business_id = new.business_id
  ) then
    raise exception 'category_id % does not belong to business %', new.category_id, new.business_id;
  end if;

  return new;
end;
$$;

create trigger trg_validate_transaction_business
  before insert or update on transactions
  for each row execute function validate_transaction_business();

-- ---------------------------------------------------------------------
-- 22. Validate transfer accounts belong to same business
-- ---------------------------------------------------------------------
create or replace function validate_transfer_accounts()
returns trigger
language plpgsql
as $$
begin
  if not exists (select 1 from financial_accounts where id = new.from_account_id and business_id = new.business_id) then
    raise exception 'from_account_id does not belong to business';
  end if;
  if not exists (select 1 from financial_accounts where id = new.to_account_id and business_id = new.business_id) then
    raise exception 'to_account_id does not belong to business';
  end if;
  return new;
end;
$$;

create trigger trg_validate_transfer_accounts
  before insert or update on account_transfers
  for each row execute function validate_transfer_accounts();

-- ---------------------------------------------------------------------
-- 23. Audit triggers for financial entities
-- ---------------------------------------------------------------------
create or replace function audit_financial_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_business_id uuid;
  v_entity_id uuid;
begin
  if tg_op = 'DELETE' then
    v_business_id := old.business_id;
    v_entity_id := old.id;
  else
    v_business_id := new.business_id;
    v_entity_id := new.id;
  end if;

  insert into audit_logs (business_id, user_id, entity, entity_id, action, before_data, after_data)
  values (
    v_business_id,
    auth.uid(),
    tg_table_name,
    v_entity_id,
    lower(tg_op),
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

create trigger trg_audit_transactions
  after insert or update or delete on transactions
  for each row execute function audit_financial_change();

create trigger trg_audit_account_transfers
  after insert or update or delete on account_transfers
  for each row execute function audit_financial_change();

create trigger trg_audit_cash_adjustments
  after insert or update or delete on cash_adjustments
  for each row execute function audit_financial_change();

-- =====================================================================
-- Row Level Security
-- =====================================================================

-- Enable RLS on every business-owned table
alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_members enable row level security;
alter table financial_accounts enable row level security;
alter table transaction_categories enable row level security;
alter table transactions enable row level security;
alter table account_transfers enable row level security;
alter table cash_adjustments enable row level security;
alter table budgets enable row level security;
alter table planned_expenses enable row level security;
alter table cash_alerts enable row level security;
alter table financial_lessons enable row level security;
alter table lesson_progress enable row level security;
alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table audit_logs enable row level security;

-- ---------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------
create policy "profiles select self" on profiles
  for select using (id = auth.uid());

create policy "profiles update self" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------
create policy "businesses select members" on businesses
  for select using (is_business_member(id));

create policy "businesses insert self-owner" on businesses
  for insert with check (owner_id = auth.uid());

create policy "businesses update owners" on businesses
  for update using (is_business_owner(id)) with check (is_business_owner(id));

create policy "businesses delete owners" on businesses
  for delete using (is_business_owner(id));

-- ---------------------------------------------------------------------
-- business_members
-- ---------------------------------------------------------------------
create policy "members select same business" on business_members
  for select using (is_business_member(business_id));

create policy "members insert owners" on business_members
  for insert with check (is_business_owner(business_id));

create policy "members update owners" on business_members
  for update using (is_business_owner(business_id))
  with check (is_business_owner(business_id));

create policy "members delete owners" on business_members
  for delete using (is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- financial_accounts
-- ---------------------------------------------------------------------
create policy "accounts select members" on financial_accounts
  for select using (is_business_member(business_id));

create policy "accounts insert writers" on financial_accounts
  for insert with check (can_write_business(business_id));

create policy "accounts update writers" on financial_accounts
  for update using (can_write_business(business_id))
  with check (can_write_business(business_id));

create policy "accounts delete owners" on financial_accounts
  for delete using (is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- transaction_categories
-- ---------------------------------------------------------------------
create policy "categories select members" on transaction_categories
  for select using (is_business_member(business_id));

create policy "categories insert writers" on transaction_categories
  for insert with check (can_write_business(business_id));

create policy "categories update writers" on transaction_categories
  for update using (can_write_business(business_id))
  with check (can_write_business(business_id));

create policy "categories delete writers" on transaction_categories
  for delete using (can_write_business(business_id) and is_system = false);

-- ---------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------
create policy "transactions select members" on transactions
  for select using (is_business_member(business_id));

create policy "transactions insert writers" on transactions
  for insert with check (can_write_business(business_id));

create policy "transactions update writers" on transactions
  for update using (can_write_business(business_id))
  with check (can_write_business(business_id));

create policy "transactions delete owners" on transactions
  for delete using (is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- account_transfers
-- ---------------------------------------------------------------------
create policy "transfers select members" on account_transfers
  for select using (is_business_member(business_id));

create policy "transfers insert writers" on account_transfers
  for insert with check (can_write_business(business_id));

create policy "transfers update writers" on account_transfers
  for update using (can_write_business(business_id))
  with check (can_write_business(business_id));

create policy "transfers delete owners" on account_transfers
  for delete using (is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- cash_adjustments
-- ---------------------------------------------------------------------
create policy "adjustments select members" on cash_adjustments
  for select using (is_business_member(business_id));

create policy "adjustments insert writers" on cash_adjustments
  for insert with check (can_write_business(business_id));

create policy "adjustments update writers" on cash_adjustments
  for update using (can_write_business(business_id))
  with check (can_write_business(business_id));

create policy "adjustments delete owners" on cash_adjustments
  for delete using (is_business_owner(business_id));

-- ---------------------------------------------------------------------
-- budgets
-- ---------------------------------------------------------------------
create policy "budgets select members" on budgets
  for select using (is_business_member(business_id));

create policy "budgets write" on budgets
  for all using (can_write_business(business_id))
  with check (can_write_business(business_id));

-- ---------------------------------------------------------------------
-- planned_expenses
-- ---------------------------------------------------------------------
create policy "planned select members" on planned_expenses
  for select using (is_business_member(business_id));

create policy "planned write" on planned_expenses
  for all using (can_write_business(business_id))
  with check (can_write_business(business_id));

-- ---------------------------------------------------------------------
-- cash_alerts
-- ---------------------------------------------------------------------
create policy "alerts select members" on cash_alerts
  for select using (is_business_member(business_id));

create policy "alerts write" on cash_alerts
  for all using (can_write_business(business_id))
  with check (can_write_business(business_id));

-- ---------------------------------------------------------------------
-- financial_lessons — public read, no client writes
-- ---------------------------------------------------------------------
create policy "lessons read published" on financial_lessons
  for select using (is_published = true or auth.role() = 'authenticated');

-- ---------------------------------------------------------------------
-- lesson_progress — user-scoped
-- ---------------------------------------------------------------------
create policy "progress select self" on lesson_progress
  for select using (user_id = auth.uid());

create policy "progress insert self" on lesson_progress
  for insert with check (user_id = auth.uid());

create policy "progress update self" on lesson_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "progress delete self" on lesson_progress
  for delete using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- quizzes — public read
-- ---------------------------------------------------------------------
create policy "quizzes read" on quizzes
  for select using (true);

-- ---------------------------------------------------------------------
-- quiz_attempts — user-scoped
-- ---------------------------------------------------------------------
create policy "attempts select self" on quiz_attempts
  for select using (user_id = auth.uid());

create policy "attempts insert self" on quiz_attempts
  for insert with check (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- audit_logs — read by business members, never written by clients
-- ---------------------------------------------------------------------
create policy "audit select members" on audit_logs
  for select using (
    business_id is null and user_id = auth.uid()
    or is_business_member(business_id)
  );

-- No INSERT/UPDATE/DELETE policies on audit_logs — server trigger writes only.

-- =====================================================================
-- Done.
-- =====================================================================
