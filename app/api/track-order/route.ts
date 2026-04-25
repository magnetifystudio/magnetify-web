import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { searchQuery } = await request.json();

    if (!searchQuery) {
      return NextResponse.json({ error: 'Search ID or Mobile is required' }, { status: 400 });
    }

    // Check if input is likely a phone number (all digits and long)
    const isMobile = /^\d+$/.test(searchQuery) && searchQuery.length >= 10;

    let query = supabase
      .from('customer_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (isMobile) {
      query = query.eq('mobile_number', searchQuery);
    } else {
      query = query.eq('order_id', searchQuery);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}