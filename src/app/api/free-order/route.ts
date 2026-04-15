export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // 1. Secure Admin Connection (ANON_KEY hata diya)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const { userId, bookId, couponCode, pointsUsed } = await req.json();

    // 2. Server-side validation (Security Upgrade)
    const { data: book, error: bookError } = await supabaseAdmin.from('books').select('final_price').eq('id', bookId).single();
    if (bookError || !book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

    // 3. Database me entry
    const { error: insertError } = await supabaseAdmin.from('orders').insert({
      customer_id: userId,
      book_id: bookId,
      // ⚠️ IMPORTANT: Yahan bhi exact wahi naam likhna jo tumhare Supabase DB me hai (amount, price, ya total)
      amount: 0, 
      payment_method: 'free_coupon',
      payment_status: 'completed',
      coupon_used: couponCode || null,
      points_used: pointsUsed || 0
    });

    if (insertError) throw new Error(insertError.message);
    
    return NextResponse.json({ success: true, message: "Free book unlocked successfully!" });
  } catch (err: any) {
    console.error("Free Order API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
