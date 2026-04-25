create extension if not exists pgcrypto;

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null,
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_email text not null,
  mobile_number text not null,
  shipping_address text not null,
  cart_items jsonb not null default '[]'::jsonb,
  item_count integer not null default 0,
  subtotal numeric(10,2) not null default 0,
  delivery_charge numeric(10,2) not null default 0,
  total_amount numeric(10,2) not null default 0,
  transaction_id text not null,
  payment_proof_path text not null,
  payment_proof_content_type text,
  payment_status text not null default 'awaiting_verification'
    check (payment_status in ('awaiting_verification', 'paid', 'payment_failed')),
  fulfillment_status text not null default 'pending'
    check (fulfillment_status in ('pending', 'in_production', 'rejected')),
  rejection_note text
);

alter table public.customer_orders enable row level security;

drop policy if exists "public_insert_customer_orders" on public.customer_orders;
create policy "public_insert_customer_orders"
  on public.customer_orders
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "admin_select_customer_orders" on public.customer_orders;
create policy "admin_select_customer_orders"
  on public.customer_orders
  for select
  to authenticated
  using ((auth.jwt() ->> 'email') = 'magnetifystudio@outlook.com');

drop policy if exists "admin_update_customer_orders" on public.customer_orders;
create policy "admin_update_customer_orders"
  on public.customer_orders
  for update
  to authenticated
  using ((auth.jwt() ->> 'email') = 'magnetifystudio@outlook.com')
  with check ((auth.jwt() ->> 'email') = 'magnetifystudio@outlook.com');

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

drop policy if exists "admin_select_payment_proofs" on storage.objects;
create policy "admin_select_payment_proofs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'payment-proofs'
    and (auth.jwt() ->> 'email') = 'magnetifystudio@outlook.com'
  );
