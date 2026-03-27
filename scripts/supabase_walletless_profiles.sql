create table if not exists public.walletless_profiles (
  magic_issuer text primary key,
  email text,
  managed_flow_address text not null,
  linked_flow_address text,
  auth_mode text not null default 'magic_walletless',
  signing_preference text not null default 'sponsored',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists walletless_profiles_email_idx
  on public.walletless_profiles (email);
