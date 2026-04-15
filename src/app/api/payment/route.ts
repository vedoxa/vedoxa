export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // 1. Secure Admin Connection
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    const rzp = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const body = await req.json();

    // ==========================================
    // ACTION 1: CREATE SECURE ORDER
    // ==========================================
    if (body.action === 'create_order') {
      const { bookId, couponCode, useRewards, userId } = body;

      // Real price aur profile fetch karo
      const { data: book, error: bookError } = await supabaseAdmin.from('books').select('*').eq('id', bookId).single();
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
      
      if (bookError || !book) return NextResponse.json({ error: "Book not found" }, { status: 404 });

      let finalPrice = book.final_price;

      // Discount Calculation
      if (couponCode) {
        const { data: coupon } = await supabaseAdmin.from('coupons').select('*').eq('code', couponCode).single();
        if (coupon && coupon.used < coupon.limit_count) {
          finalPrice = Math.round(finalPrice - (finalPrice * coupon.discount / 100));
        }
      }
      if (useRewards && profile?.reward_points > 0) {
        finalPrice = Math.max(0, finalPrice - profile.reward_points);
      }

      // Razorpay Order Creation (Strictly in Paise)
      const order = await rzp.orders.create({ 
        amount: Math.round(finalPrice * 100), 
        currency: "INR" 
      });
      
      return NextResponse.json({ rzpOrderId: order.id, amount: finalPrice, realBookPrice: book.final_price });
    }

    // ==========================================
    // ACTION 2: VERIFY SIGNATURE & SAVE
    // ==========================================
    if (body.action === 'verify') {
      const { rzpOrderId, rzpPaymentId, rzpSignature, orderData } = body;
      
      // Cryptographic Security Check
      const sign = rzpOrderId + "|" + rzpPaymentId;
      const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
                                 .update(sign)
                                 .digest("hex");

      if (expectedSign === rzpSignature) {
        // Asli Payment Confirm -> DB me safe entry
        const { error: insertError } = await supabaseAdmin.from('orders').insert([{ 
          customer_id: orderData.customer_id,
          book_id: orderData.book_id,
          // ⚠️ IMPORTANT: 'amount' ya 'total_amount' likho jo tumhare DB me ho. 'amount_paid' mat likhna agar wo DB me nahi hai.
          amount: orderData.final_price, 
          payment_method: 'razorpay',
          payment_status: 'completed',
          rzp_order_id: rzpOrderId,
          rzp_payment_id: rzpPaymentId
        }]);

        if (insertError) throw new Error(insertError.message);
        
        // Reward Points Update
        const earnedPoints = Math.floor(orderData.final_price * 0.019);
        const { data: profile } = await supabaseAdmin.from('profiles').select('reward_points').eq('id', orderData.customer_id).single();
        
        const newPoints = (profile?.reward_points || 0) - (orderData.points_used || 0) + earnedPoints;
        await supabaseAdmin.from('profiles').update({ reward_points: newPoints }).eq('id', orderData.customer_id);

        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, error: "Payment Hack Attempt Detected!" }, { status: 400 });
      }
    }
  } catch (error: any) {
    console.error("Payment API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
