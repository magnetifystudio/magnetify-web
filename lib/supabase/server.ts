import { createClient } from "@supabase/supabase-js";

type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CustomerOrderRow = {
  id: string;
  order_id: string;
  created_at: string;
  customer_name: string;
  customer_email: string;
  mobile_number: string;
  shipping_address: string;
  cart_items: Json;
  item_count: number;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  transaction_id: string;
  payment_proof_path: string;
  payment_proof_content_type: string | null;
  payment_status:
    | "awaiting_verification"
    | "paid"
    | "payment_failed";
  fulfillment_status:
    | "pending"
    | "in_production"
    | "rejected";
  rejection_note: string | null;
};

export type CustomerOrderInsert = Omit<CustomerOrderRow, "id" | "created_at"> & {
  id?: string;
  created_at?: string;
};

type Database = {
  public: {
    Tables: {
      customer_orders: {
        Row: CustomerOrderRow;
        Insert: CustomerOrderInsert;
        Update: Partial<CustomerOrderRow>;
      };
    };
  };
};

function getRequiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function createBaseClient(key: string) {
  return createClient<Database>(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function createPublicSupabaseClient() {
  return createBaseClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createServiceSupabaseClient() {
  return createBaseClient(getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));
}
