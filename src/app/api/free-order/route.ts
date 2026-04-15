import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, bookId, couponCode, pointsUsed } = await req.json();

    // Direct database insert bypassing Razorpay
    const { error } = await supabase.from('orders').insert({
      customer_id: userId,
      book_id: bookId,
      amount_paid: 0,
      payment_method: 'free_coupon',
      coupon_used: couponCode || null,
      points_used: pointsUsed || 0,
      status: 'completed'
    });

    if (error) throw error;
    
    return NextResponse.json({ success: true, message: "Free book unlocked!" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
