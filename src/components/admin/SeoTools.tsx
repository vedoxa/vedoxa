// @ts-nocheck
/* eslint-disable */
// Place at: src/components/admin/SeoTools.tsx
"use client";
import { useState, useEffect, useMemo, useRef } from "react";

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = "https://vedoxa.shop";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STATIC_PATHS = [
  "",
  "/explore",
  "/blog",
  "/quiz",
  "/self",
  "/reward-points",
  "/support",
  "/about",
  "/brand",
  "/contact",
  "/terms",
  "/privacy",
  "/refund",
];

/* ------------------------------ Hindi to Roman & Smart Slug Helpers ------------------------------ */
const HINDI_MAP = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo", ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au", अं: "an", अः: "ah",
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v", श: "sh", ष: "sh", स: "s", ह: "h",
  क्ष: "ksh", त्र: "tr", ज्ञ: "gya", श्र: "shr",
  ड़: "d", ढ़: "dh", क़: "q", ख़: "kh", ग़: "gh", ज़: "z", फ़: "f",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ं": "n", "ँ": "n", "ः": "h", "्": "", "़": "",
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

function transliterateToRoman(input) {
  const str = String(input || "");
  if (!/[\u0900-\u097F]/.test(str)) return str;
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const next = str[i + 1] || "";
    if (HINDI_MAP[ch + next] !== undefined) {
      out += HINDI_MAP[ch + next];
      i++;
      continue;
    }
    if (HINDI_MAP[ch] !== undefined) {
      const val = HINDI_MAP[ch];
      const isConsonant = ch >= "क" && ch <= "ह";
      const nextIsVowelSign = next >= "ा" && next <= "्";
      const nextIsSpaceOrEnd = !next || /[\s.,!?:;'"()\-–—/]/.test(next);
      if (isConsonant && !nextIsVowelSign && !nextIsSpaceOrEnd) {
        out += val + "a";
      } else {
        out += val;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function slugify(text) {
  const roman = transliterateToRoman(text);
  return String(roman || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 65)
    .replace(/-+$/, "");
}

// Check karta hai ki slug kahin 'book-2dbcc52d' jaisa random ID ya UUID toh nahi hai
function isRandomId(val) {
  if (!val) return true;
  const v = String(val).trim();
  return /^(book|post|article)-[a-f0-9]{6,}$/i.test(v) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v);
}

// Hamesha Book ya Post ke asli naam (Title) se clean slug deta hai
function getCleanSlug(item) {
  if (!item) return "";
  const raw = item.slug ? String(item.slug).trim() : "";
  if (raw && !isRandomId(raw) && SLUG_RE.test(raw)) return raw;
  const fromTitle = slugify(item.title);
  if (fromTitle && SLUG_RE.test(fromTitle)) return fromTitle;
  return raw || String(item.id || "");
}

// Book ke liye 150+ words ka SEO-friendly description auto-generate karne ka helper
function generateSeoBookDescription(b) {
  const title = (b.title || "Yeh Kitab").trim();
  const author = b.author ? ` (Lekhak: ${b.author})` : "";
  const price = b.final_price != null ? `₹${b.final_price}` : "kifayati daam";
  const existing = String(b.description || "").trim();

  const baseIntro = existing
    ? `${existing}\n\n`
    : `${title}${author} Vedoxa Premium Library ki ek behad upyogi aur life-changing Hindi digital book (eBook) hai. Yeh kitab un sabhi readers ke liye khaas taur par tayyar ki gayi hai jo apni soch, mindset, psychology, aatm-vishwas aur jeevan ko ek naye aayam par le jana chahte hain.\n\n`;

  const seoBody =
    `Is Hindi digital book mein aapko kya-kya seekhne ko milega:\n` +
    `• ${title} ke sabse mahatvapurna siddhant aasan aur vyavaharik (practical) Hindi bhasha mein samjhaye gaye hain.\n` +
    `• Rozmarra ki zindagi,overthinking, rishton, safalta aur mental clarity se judi samasyaon ka step-by-step samadhan.\n` +
    `• Aise proven psychological tarike aur habits jinhe aap aaj se hi apni life mein apply kar sakte hain.\n` +
    `• Gehri adhyatmik (spiritual) aur manovaigyanik samajh jo aapkechintan ko majboot banati hai.\n\n` +
    `Yeh kitab kiske liye hai?\n` +
    `Agar aap self-improvement, psychology, spirituality, ya personal growth mein ruchi rakhte hain, toh "${title}" aapke liye ek zaroori guide hai. Vedoxa par yeh digital book matra ${price} mein uplabdh hai. Razorpay surakshit payment (UPI, Card, NetBanking) ke turant baad bina kisi intezaar ke aap is kitab ko apne phone, tablet ya computer par Vedoxa Cloud Reader mein kabhi bhi padh sakte hain.`;

  return (baseIntro + seoBody).trim();
}

function countWords(t) {
  return String(t || "").trim().split(/\s+/).filter(Boolean).length;
}

export default function SeoTools({ supabase, addNotification, books = [], onSaved }) {
  const notify = (m, t = "info") => {
    try { if (addNotification) addNotification(m, t); } catch (e) {}
  };

  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [bulkFixing, setBulkFixing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [showUrls, setShowUrls] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const autoSyncedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from("posts").select("id, title, slug, published, published_at");
        setPosts(data || []);
      } catch (e) {
        setPosts([]);
      }
    })();
  }, [supabase]);

  // NEW: Background Auto-Sync — Jin books me slug khali hai ya 'book-2dbcc52d' jaisa random ID hai, unme apne aap Book ka naam save kar dega
  useEffect(() => {
    if (!supabase || !books || !books.length || autoSyncedRef.current) return;
    autoSyncedRef.current = true;
    (async () => {
      let updatedCount = 0;
      const usedSlugs = new Set(
        books
          .map((x) => (x.slug && !isRandomId(x.slug) ? String(x.slug).trim() : ""))
          .filter(Boolean)
      );

      for (const b of books) {
        const currentSlug = b.slug ? String(b.slug).trim() : "";
        if (!currentSlug || isRandomId(currentSlug)) {
          let candidate = slugify(b.title);
          if (!candidate || !SLUG_RE.test(candidate)) continue;
          if (usedSlugs.has(candidate)) {
            candidate = `${candidate}-${String(b.id).slice(-4).toLowerCase().replace(/[^a-z0-9]/g, "") || "1"}`;
          }
          usedSlugs.add(candidate);
          try {
            const { error } = await supabase.from("books").update({ slug: candidate }).eq("id", b.id);
            if (!error) {
              b.slug = candidate;
              updatedCount++;
            }
          } catch (e) {}
        }
      }
      if (updatedCount > 0) {
        notify(`${updatedCount} books ke link me random ID ki jagah unka naam auto-save ho gaya ✅`, "success");
        if (onSaved) onSaved();
      }
    })();
  }, [supabase, books]);

  // Agar book ka slug random ID ('book-2dbcc52d') hai toh input me pehle se clean naam suggest karega
  const val = (b) => {
    if (edits[b.id]) return edits[b.id];
    const rawSlug = b.slug ? String(b.slug).trim() : "";
    const effectiveSlug = rawSlug && !isRandomId(rawSlug) ? rawSlug : getCleanSlug(b);
    return { slug: effectiveSlug, description: b.description || "" };
  };

  const setEdit = (b, patch) => setEdits((prev) => ({ ...prev, [b.id]: { ...val(b), ...patch } }));

  const isDirty = (b) => {
    const e = edits[b.id];
    const hasRandomOrEmptySlug = !b.slug || isRandomId(b.slug);
    if (hasRandomOrEmptySlug && val(b).slug && !isRandomId(val(b).slug)) return true;
    return !!e && (e.slug !== (b.slug || "") || e.description !== (b.description || ""));
  };

  const stats = useMemo(() => {
    let missing = 0, short = 0, noCover = 0, noSlug = 0;
    books.forEach((b) => {
      const w = countWords(b.description);
      if (w === 0) missing++;
      else if (w < 100) short++;
      if (!b.cover_path) noCover++;
      // Random ID ('book-2dbcc52d') ko bhi "Slug nahi / Random ID" me gina jayega
      if (!b.slug || isRandomId(b.slug)) noSlug++;
    });
    return { missing, short, noCover, noSlug };
  }, [books]);

  const saveBook = async (b) => {
    const v = val(b);
    const s = slugify(v.slug || b.title);
    if (!SLUG_RE.test(s)) return notify("Slug sirf a-z, 0-9 aur - se bana ho", "error");
    setSavingId(b.id);
    const { error } = await supabase.from("books").update({ slug: s, description: v.description }).eq("id", b.id);
    setSavingId(null);
    if (error) {
      if (error.code === "23505") return notify("Ye slug kisi aur book ka hai. Dusra slug rakho.", "error");
      return notify("Save nahi hua: " + error.message, "error");
    }
    b.slug = s;
    b.description = v.description;
    notify("Book SEO aur Naam wala Link save ho gaya ✅", "success");
    setEdits((prev) => {
      const next = { ...prev };
      delete next[b.id];
      return next;
    });
    if (onSaved) onSaved();
  };

  // NEW: 1-Click me sabhi books ke slugs aur short descriptions ko SEO friendly banane ka function
  const fixAllBooksSeo = async () => {
    if (bulkFixing || !books.length) return;
    setBulkFixing(true);
    let fixed = 0;
    const usedSlugs = new Set();

    for (const b of books) {
      const v = val(b);
      let s = v.slug && !isRandomId(v.slug) ? slugify(v.slug) : getCleanSlug(b);
      if (!s || !SLUG_RE.test(s)) s = slugify(b.title);
      if (usedSlugs.has(s)) {
        s = `${s}-${String(b.id).slice(-4).toLowerCase().replace(/[^a-z0-9]/g, "") || "1"}`;
      }
      usedSlugs.add(s);

      const desc = countWords(v.description) >= 100 ? v.description : generateSeoBookDescription(b);
      const needsUpdate = s !== b.slug || desc !== b.description;

      if (needsUpdate && SLUG_RE.test(s)) {
        const { error } = await supabase.from("books").update({ slug: s, description: desc }).eq("id", b.id);
        if (!error) {
          b.slug = s;
          b.description = desc;
          fixed++;
        }
      }
    }

    setBulkFixing(false);
    setEdits({});
    if (fixed > 0) {
      notify(`${fixed} books ke Naam (Slugs) aur SEO Descriptions update ho gaye 🚀`, "success");
      if (onSaved) onSaved();
    } else {
      notify("Sabhi books ke links aur descriptions pehle se sahi hain ✅", "info");
    }
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copy ho gaya ✅", "success");
    } catch (e) {
      notify("Copy nahi hua", "error");
    }
  };

  // FIX: Saare public links me hamesha Book aur Blog ka clean naam aayega, random ID nahi
  const urls = useMemo(() => {
    const list = STATIC_PATHS.map((p) => `${SITE_URL}${p}`);
    books.forEach((b) => {
      const cleanBookSlug = getCleanSlug(b);
      if (cleanBookSlug) list.push(`${SITE_URL}/book/${cleanBookSlug}`);
    });
    posts
      .filter((p) => p.published && (!p.published_at || new Date(p.published_at) <= new Date()))
      .forEach((p) => {
        const cleanPostSlug = getCleanSlug(p);
        if (cleanPostSlug) list.push(`${SITE_URL}/blog/${cleanPostSlug}`);
      });
    return list;
  }, [books, posts]);

  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        (b.title || "").toLowerCase().includes(q) ||
        (b.slug || "").toLowerCase().includes(q) ||
        (b.description || "").toLowerCase().includes(q)
    );
  }, [books, searchQuery]);

  const inputCls = "w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/50 p-6 rounded-2xl border border-cyan-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300">🔎 SEO Tools</h2>
          <p className="text-cyan-200/80 text-sm mt-1">Har book ka link (slug) aur description yahin se sudharo, taaki Google par achhe se dikhe.</p>
        </div>
        {books.length > 0 && (
          <button
            onClick={fixAllBooksSeo}
            disabled={bulkFixing}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-black shadow-lg transition shrink-0"
          >
            {bulkFixing ? "⏳ Sabhi Books Fix ho rahi hain..." : "⚡ 1-Click: Sabhi Books ka Naam & SEO Fix Karo"}
          </button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Description nahi", v: stats.missing, bad: stats.missing > 0 },
          { label: "Description chhota (<100 shabd)", v: stats.short, bad: stats.short > 0 },
          { label: "Cover nahi", v: stats.noCover, bad: stats.noCover > 0 },
          { label: "Slug nahi / Random ID", v: stats.noSlug, bad: stats.noSlug > 0 },
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
        ⚠️ Jis book ka link Google me aa chuka hai, uska slug mat badlo. Jin books me `book-2dbcc52d` jaisa random number tha, unme ab book ka asli naam lag gaya hai.
      </p>

      {/* Book Search Filter */}
      {books.length > 3 && (
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Book ka naam ya slug khojein..."
            className={inputCls}
          />
        </div>
      )}

      {/* Books */}
      <div className="space-y-4">
        {filteredBooks.map((b) => {
          const v = val(b);
          const w = countWords(v.description);
          const currentCleanSlug = (v.slug || "").trim();
          const slugOk = SLUG_RE.test(currentCleanSlug) && !isRandomId(currentCleanSlug);
          const publicSlug = slugOk ? currentCleanSlug : getCleanSlug(b);
          const pageUrl = `${SITE_URL}/book/${publicSlug}`;
          const wasRandom = !b.slug || isRandomId(b.slug);

          return (
            <div key={b.id} className="bg-slate-900/70 border border-indigo-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white break-words">{b.title}</h3>
                  <p className="text-xs font-mono text-cyan-300/90 mt-0.5 break-all">{pageUrl}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <a href={`/book/${publicSlug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Dekho</a>
                  <button onClick={() => copyText(pageUrl)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">Link</button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                    Slug (Book Link Name)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEdit(b, { slug: slugify(b.title) })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-bold text-cyan-300"
                  >
                    ✨ Naam se Slug Banao
                  </button>
                </div>
                <input
                  value={v.slug}
                  onChange={(e) => setEdit(b, { slug: slugify(e.target.value) })}
                  className={inputCls + " font-mono text-sm"}
                  placeholder="dil-jeetne-ki-kala"
                />
                {!slugOk && (
                  <p className="text-xs text-red-300 mt-1">
                    Sirf a-z, 0-9 aur - (random ID nahi, book ka asli naam rakho jaise dil-jeetne-ki-kala)
                  </p>
                )}
                {wasRandom && slugOk && (
                  <p className="text-xs text-amber-300 mt-1">
                    💡 Pehle is book me random ID tha, ab naam wala slug tayyar hai — niche Save dabayein.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                    Description (Google SEO ke liye)
                  </label>
                  <button
                    type="button"
                    onClick={() => setEdit(b, { description: generateSeoBookDescription(b) })}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-[11px] font-bold text-cyan-300"
                  >
                    ✨ Auto SEO Description (150+ shabd)
                  </button>
                </div>
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

              {/* Google Search Preview */}
              <div className="rounded-xl bg-white p-3">
                <p className="truncate text-[11px] text-slate-600">vedoxa.shop › book › {publicSlug}</p>
                <p className="mt-0.5 text-[15px] font-semibold leading-snug text-[#1a0dab] break-words">
                  {b.title} – Hindi Digital Book | Vedoxa
                </p>
                <p className="mt-0.5 text-xs leading-snug text-slate-600 line-clamp-2 break-words">
                  {(v.description || `${b.title}: Vedoxa par Hindi digital book. Payment ke baad turant padhein.`).slice(0, 160)}
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
