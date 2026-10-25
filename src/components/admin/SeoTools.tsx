// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useMemo } from "react";

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = "https://vedoxa.shop";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STATIC_PATHS = ["", "/explore", "/blog", "/about", "/brand", "/contact", "/terms", "/privacy", "/refund"];

function countWords(t) {
  return String(t || "").trim().split(/\s+/).filter(Boolean).length;
}

export default function SeoTools({ supabase, addNotification, books = [], onSaved }) {
  const notify = (m, t = "info") => {
    try { if (addNotification) addNotification(m, t); } catch (e) {}
  };

  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [posts, setPosts] = useState([]);
  const [showUrls, setShowUrls] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("posts").select("slug, published, published_at");
        setPosts(data || []);
      } catch (e) {
        setPosts([]);
      }
    })();
  }, []);

  const val = (b) => edits[b.id] || { slug: b.slug || "", description: b.description || "" };
  const setEdit = (b, patch) => setEdits((prev) => ({ ...prev, [b.id]: { ...val(b), ...patch } }));
  const isDirty = (b) => {
    const e = edits[b.id];
    return !!e && (e.slug !== (b.slug || "") || e.description !== (b.description || ""));
  };

  const stats = useMemo(() => {
    let missing = 0, short = 0, noCover = 0, noSlug = 0;
    books.forEach((b) => {
      const w = countWords(b.description);
      if (w === 0) missing++;
      else if (w < 100) short++;
      if (!b.cover_path) noCover++;
      if (!b.slug) noSlug++;
    });
    return { missing, short, noCover, noSlug };
  }, [books]);

  const saveBook = async (b) => {
    const v = val(b);
    const s = (v.slug || "").trim();
    if (!SLUG_RE.test(s)) return notify("Slug sirf a-z, 0-9 aur - se bana ho", "error");
    setSavingId(b.id);
    const { error } = await supabase.from("books").update({ slug: s, description: v.description }).eq("id", b.id);
    setSavingId(null);
    if (error) {
      if (error.code === "23505") return notify("Ye slug kisi aur book ka hai. Dusra slug rakho.", "error");
      return notify("Save nahi hua: " + error.message, "error");
    }
    notify("Book SEO save ho gaya ✅", "success");
    setEdits((prev) => {
      const next = { ...prev };
      delete next[b.id];
      return next;
    });
    if (onSaved) onSaved();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copy ho gaya ✅", "success");
    } catch (e) {
      notify("Copy nahi hua", "error");
    }
  };

  const urls = useMemo(() => {
    const list = STATIC_PATHS.map((p) => `${SITE_URL}${p}`);
    books.forEach((b) => list.push(`${SITE_URL}/book/${b.slug || b.id}`));
    posts
      .filter((p) => p.published && new Date(p.published_at) <= new Date())
      .forEach((p) => list.push(`${SITE_URL}/blog/${p.slug}`));
    return list;
  }, [books, posts]);

  const inputCls = "w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-slate-900/50 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">🔎 SEO Tools</h2>
        <p className="text-cyan-200/80 text-sm mt-1">Har book ka link (slug) aur description yahin se sudharo, taaki Google par achhe se dikhe.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Description nahi", v: stats.missing, bad: stats.missing > 0 },
          { label: "Description chhota (<100 shabd)", v: stats.short, bad: stats.short > 0 },
          { label: "Cover nahi", v: stats.noCover, bad: stats.noCover > 0 },
          { label: "Slug nahi", v: stats.noSlug, bad: stats.noSlug > 0 },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-2xl border ${s.bad ? "bg-amber-500/10 border-amber-500/40" : "bg-green-500/10 border-green-500/30"}`}>
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.bad ? "text-amber-300" : "text-green-300"}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">Search Console kholo</a>
        <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">sitemap.xml</a>
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">robots.txt</a>
        <button onClick={() => setShowUrls((v) => !v)} className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">
          {showUrls ? "Links chhupao" : `Saare public links (${urls.length})`}
        </button>
      </div>

      {showUrls && (
        <div className="bg-slate-900/70 border border-indigo-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-slate-400">Search Console → URL inspection me ek ek link daalke "Request indexing" dabao.</p>
            <button onClick={() => copyText(urls.join("\n"))} className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold whitespace-nowrap">Sab copy</button>
          </div>
          <ul className="max-h-72 overflow-y-auto space-y-1">
            {urls.map((u) => (
              <li key={u} className="flex items-center justify-between gap-2 bg-slate-800/60 rounded-lg px-3 py-2">
                <span className="text-xs font-mono text-slate-300 break-all">{u}</span>
                <button onClick={() => copyText(u)} className="text-xs font-bold text-blue-300 hover:text-blue-200 shrink-0">Copy</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3">
        ⚠️ Jis book ka link Google me aa chuka hai, uska slug mat badlo. Badla to purana link band ho jayega.
      </p>

      {/* Books */}
      <div className="space-y-4">
        {books.map((b) => {
          const v = val(b);
          const w = countWords(v.description);
          const slugOk = SLUG_RE.test((v.slug || "").trim());
          const pageUrl = `${SITE_URL}/book/${(b.slug || b.id)}`;
          return (
            <div key={b.id} className="bg-slate-900/70 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base sm:text-lg font-black text-white break-words">{b.title}</h3>
                <div className="flex gap-2 shrink-0">
                  <a href={`/book/${b.slug || b.id}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Dekho</a>
                  <button onClick={() => copyText(pageUrl)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Link</button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-300 mb-1 uppercase tracking-wide">Slug</label>
                <input
                  value={v.slug}
                  onChange={(e) => setEdit(b, { slug: e.target.value.toLowerCase() })}
                  className={inputCls + " font-mono text-sm"}
                  placeholder="dil-jeetne-ki-kala"
                />
                {!slugOk && <p className="text-xs text-red-300 mt-1">Sirf a-z, 0-9 aur - (jaise dil-jeetne-ki-kala)</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-indigo-300 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  value={v.description}
                  onChange={(e) => setEdit(b, { description: e.target.value })}
                  className={inputCls + " h-36 leading-7"}
                  placeholder="Book ke baare me 150+ shabd likho: kis ke liye hai, kya seekhne ko milega, kaun si problem hal hogi."
                />
                <p className={`text-xs mt-1 ${w >= 150 ? "text-green-300" : w >= 100 ? "text-amber-300" : "text-red-300"}`}>
                  {w} shabd {w >= 150 ? "✅ achha" : "(150+ shabd Google ko behtar lagte hain)"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => saveBook(b)}
                  disabled={!isDirty(b) || !slugOk || savingId === b.id}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 text-white text-sm font-black transition"
                >
                  {savingId === b.id ? "Save ho raha hai..." : "💾 Save"}
                </button>
                {isDirty(b) && <span className="text-xs text-amber-300">Unsaved badlaav</span>}
              </div>
            </div>
          );
        })}
        {books.length === 0 && <p className="text-slate-500 text-center py-10">Abhi koi book nahi mili.</p>}
      </div>
    </div>
  );
}
