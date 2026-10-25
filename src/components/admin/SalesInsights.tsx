// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useMemo } from "react";

function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function buildBuckets(range) {
  const now = new Date();
  const buckets = [];

  if (range === "7" || range === "30") {
    const n = Number(range);
    const today = startOfDay(now);
    for (let i = n - 1; i >= 0; i--) {
      const s = new Date(today);
      s.setDate(s.getDate() - i);
      const e = new Date(s);
      e.setDate(e.getDate() + 1);
      buckets.push({ start: s, end: e, label: `${s.getDate()}/${s.getMonth() + 1}`, total: 0, count: 0 });
    }
  } else if (range === "90") {
    const tomorrow = startOfDay(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (let i = 12; i >= 0; i--) {
      const e = new Date(tomorrow);
      e.setDate(e.getDate() - i * 7);
      const s = new Date(e);
      s.setDate(s.getDate() - 7);
      buckets.push({ start: s, end: e, label: `${s.getDate()}/${s.getMonth() + 1}`, total: 0, count: 0 });
    }
  } else {
    for (let i = 11; i >= 0; i--) {
      const s = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const e = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({ start: s, end: e, label: s.toLocaleString("en-IN", { month: "short" }), total: 0, count: 0 });
    }
  }
  return buckets;
}

function toCsv(rows, columns) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = columns.join(",");
  const body = rows.map((r) => columns.map((c) => esc(r[c])).join(",")).join("\n");
  return head + "\n" + body;
}

function downloadCsv(filename, text) {
  const blob = new Blob(["\ufeff" + text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const RANGES = [
  { id: "7", label: "7 din" },
  { id: "30", label: "30 din" },
  { id: "90", label: "90 din" },
  { id: "all", label: "Sab" },
];

export default function SalesInsights({ orders = [], books = [], customers = [] }) {
  const [range, setRange] = useState("30");

  const data = useMemo(() => {
    const now = new Date();
    const days = range === "all" ? null : Number(range);
    const cutoff = days ? new Date(now.getTime() - days * 86400000) : null;
    const inRange = orders.filter((o) => !cutoff || new Date(o.created_at) >= cutoff);

    const amount = (o) => Number(o.final_price) || 0;
    const revenue = inRange.reduce((s, o) => s + amount(o), 0);
    const paid = inRange.filter((o) => amount(o) > 0);
    const aov = paid.length ? revenue / paid.length : 0;

    const buyers = new Set(inRange.map((o) => o.customer_id).filter(Boolean));
    const buyerCount = {};
    orders.forEach((o) => {
      if (o.customer_id) buyerCount[o.customer_id] = (buyerCount[o.customer_id] || 0) + 1;
    });
    const repeatBuyers = Object.values(buyerCount).filter((n) => n > 1).length;

    const withCoupon = inRange.filter((o) => o.coupon_used).length;
    const freeOrders = inRange.filter((o) => amount(o) === 0).length;

    // chart buckets
    const buckets = buildBuckets(range);
    inRange.forEach((o) => {
      const t = new Date(o.created_at);
      const b = buckets.find((x) => t >= x.start && t < x.end);
      if (b) {
        b.total += amount(o);
        b.count += 1;
      }
    });
    const maxBucket = Math.max(1, ...buckets.map((b) => b.total));

    // top books
    const byBook = {};
    inRange.forEach((o) => {
      const key = o.book_id || o.book_title || "unknown";
      if (!byBook[key]) byBook[key] = { title: o.book_title || "—", revenue: 0, count: 0 };
      byBook[key].revenue += amount(o);
      byBook[key].count += 1;
    });
    const topBooks = Object.values(byBook).sort((a, b) => b.revenue - a.revenue || b.count - a.count).slice(0, 5);
    const maxBookRev = Math.max(1, ...topBooks.map((b) => b.revenue || b.count));

    // coupons
    const byCoupon = {};
    inRange.forEach((o) => {
      if (!o.coupon_used) return;
      byCoupon[o.coupon_used] = (byCoupon[o.coupon_used] || 0) + 1;
    });
    const topCoupons = Object.entries(byCoupon).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // payment methods
    const byMethod = {};
    inRange.forEach((o) => {
      const m = o.payment_method || "unknown";
      byMethod[m] = (byMethod[m] || 0) + 1;
    });

    return {
      inRange, revenue, paidCount: paid.length, aov, buyers: buyers.size, repeatBuyers,
      withCoupon, freeOrders, buckets, maxBucket, topBooks, maxBookRev, topCoupons, byMethod,
    };
  }, [orders, range]);

  const exportOrders = () => {
    const cols = ["id", "created_at", "customer_name", "customer_email", "book_title", "final_price", "coupon_used", "payment_method"];
    downloadCsv(`orders-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(orders, cols));
  };

  const exportCustomers = () => {
    const cols = ["id", "name", "email", "phone", "reward_points"];
    downloadCsv(`customers-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(customers, cols));
  };

  const card = "bg-slate-900/70 border border-indigo-500/20 rounded-2xl p-5";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">📈 Sales Insights</h2>
          <p className="text-emerald-200/80 text-sm mt-1">Asli orders se kamai, best books aur coupons ka hisaab.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap border transition ${range === r.id ? "bg-emerald-600 border-emerald-400 text-white" : "bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={card}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Kamai</p>
          <p className="text-3xl font-black text-green-300 mt-1">₹{Math.round(data.revenue)}</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Orders</p>
          <p className="text-3xl font-black text-white mt-1">{data.inRange.length}</p>
          <p className="text-xs text-slate-500 mt-1">{data.paidCount} paid • {data.freeOrders} free</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Average order</p>
          <p className="text-3xl font-black text-white mt-1">₹{Math.round(data.aov)}</p>
        </div>
        <div className={card}>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Khareedne wale</p>
          <p className="text-3xl font-black text-white mt-1">{data.buyers}</p>
          <p className="text-xs text-slate-500 mt-1">{data.repeatBuyers} ne dobara kharida</p>
        </div>
      </div>

      {/* Chart */}
      <div className={card}>
        <p className="text-sm font-black text-white mb-4">Kamai ka graph</p>
        {data.inRange.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-10">Is samay me koi order nahi.</p>
        ) : (
          <div className="flex items-end gap-1 h-44">
            {data.buckets.map((b, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0" title={`${b.label}: ₹${Math.round(b.total)} (${b.count} orders)`}>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-emerald-600 to-cyan-400"
                  style={{ height: `${Math.max(b.total > 0 ? 4 : 1, (b.total / data.maxBucket) * 100)}%`, opacity: b.total > 0 ? 1 : 0.25 }}
                />
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-1 mt-2">
          {data.buckets.map((b, i) => (
            <span key={i} className="flex-1 text-center text-[9px] text-slate-500 truncate">
              {data.buckets.length > 14 ? (i % 5 === 0 ? b.label : "") : b.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top books */}
        <div className={card}>
          <p className="text-sm font-black text-white mb-4">Top books</p>
          {data.topBooks.length === 0 ? (
            <p className="text-slate-500 text-sm">Abhi data nahi.</p>
          ) : (
            <ul className="space-y-3">
              {data.topBooks.map((b, i) => (
                <li key={i}>
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="text-slate-200 font-bold break-words min-w-0">{i + 1}. {b.title}</span>
                    <span className="text-green-300 font-black shrink-0">₹{Math.round(b.revenue)} <span className="text-slate-500 font-normal">({b.count})</span></span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full" style={{ width: `${((b.revenue || b.count) / data.maxBookRev) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Coupons + payment */}
        <div className={card}>
          <p className="text-sm font-black text-white mb-4">Coupons aur payment</p>
          <p className="text-xs text-slate-400 mb-2">{data.withCoupon} orders me coupon laga</p>
          {data.topCoupons.length === 0 ? (
            <p className="text-slate-500 text-sm mb-4">Is samay me koi coupon use nahi hua.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {data.topCoupons.map(([code, n]) => (
                <li key={code} className="flex justify-between bg-slate-800/60 rounded-lg px-3 py-2 text-sm">
                  <span className="font-mono font-bold text-pink-300">{code}</span>
                  <span className="text-slate-300">{n} baar</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.byMethod).map(([m, n]) => (
              <span key={m} className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300">{m}: {n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Export */}
      <div className={card}>
        <p className="text-sm font-black text-white mb-1">Data download (CSV)</p>
        <p className="text-xs text-slate-500 mb-3">Isme customers ki personal jaankari hai, ise surakshit rakho.</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportOrders} className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold">Orders ({orders.length})</button>
          <button onClick={exportCustomers} className="px-4 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold">Customers ({customers.length})</button>
        </div>
      </div>
    </div>
  );
}
