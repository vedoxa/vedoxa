// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useMemo, useRef } from "react";

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = "https://vedoxa.shop";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const pad = (n) => String(n).padStart(2, "0");

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/, "");
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function statusOf(p) {
  if (!p.published) return "draft";
  return new Date(p.published_at) > new Date() ? "scheduled" : "published";
}

function countWords(t) {
  return String(t || "").trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
}

// ---- Preview (website jaisa hi simple formatter) ----
function renderInline(text) {
  const parts = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
  let last = 0;
  let i = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a key={"l" + i} href={m[2]} target="_blank" rel="noopener noreferrer" className="text-amber-400 underline underline-offset-4">
        {m[1]}
      </a>
    );
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function renderPreview(content) {
  const blocks = String(content || "").replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks.map((block, idx) => {
    const text = block.trim();
    if (!text) return null;
    if (text.startsWith("### ")) return <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-2">{renderInline(text.slice(4))}</h3>;
    if (text.startsWith("## ")) return <h2 key={idx} className="text-xl font-bold text-white mt-8 mb-3">{renderInline(text.slice(3))}</h2>;
    const lines = text.split("\n");
    if (lines.every((l) => l.trim().startsWith("- "))) {
      return (
        <ul key={idx} className="list-disc pl-6 my-4 space-y-1 text-slate-300">
          {lines.map((l, j) => <li key={j}>{renderInline(l.trim().slice(2))}</li>)}
        </ul>
      );
    }
    return <p key={idx} className="my-4 leading-8 text-slate-300 whitespace-pre-line">{renderInline(lines.join("\n"))}</p>;
  });
}

const STATUS_STYLE = {
  published: "bg-green-500/20 text-green-300 border-green-500/40",
  scheduled: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  draft: "bg-slate-600/30 text-slate-300 border-slate-500/40",
};
const STATUS_LABEL = { published: "LIVE", scheduled: "SCHEDULED", draft: "DRAFT" };

export default function BlogManager({ supabase, addNotification, books = [] }) {
  const notify = (m, t = "info") => {
    try { if (addNotification) addNotification(m, t); } catch (e) {}
  };

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState([]);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bookPick, setBookPick] = useState("");
  const taRef = useRef(null);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    if (error) {
      setLoadError(error.message || "Posts load nahi hue");
      setPosts([]);
    } else {
      setLoadError("");
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const counts = useMemo(() => {
    const c = { all: posts.length, published: 0, scheduled: 0, draft: 0 };
    posts.forEach((p) => { c[statusOf(p)]++; });
    return c;
  }, [posts]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter !== "all" && statusOf(p) !== filter) return false;
      if (!q) return true;
      return (p.title || "").toLowerCase().includes(q) || (p.slug || "").toLowerCase().includes(q);
    });
  }, [posts, search, filter]);

  const editingPost = posts.find((p) => p.id === editingId) || null;

  // ---------- editor open/close ----------
  const openNew = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setSlugTouched(false);
    setDescription("");
    setContent("");
    setPublishAt("");
    setShowPreview(false);
    setBookPick("");
    setEditorOpen(true);
  };

  const openEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title || "");
    setSlug(p.slug || "");
    setSlugTouched(true);
    setDescription(p.description || "");
    setContent(p.content || "");
    setPublishAt(statusOf(p) === "scheduled" ? toLocalInput(p.published_at) : "");
    setShowPreview(false);
    setBookPick("");
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if ((title || content) && !window.confirm("Bina save kiye band karna hai? Badlaav chale jayenge.")) return;
    setEditorOpen(false);
  };

  // ---------- toolbar ----------
  const wrap = (before, after = "", placeholder = "") => {
    const ta = taRef.current;
    if (!ta || showPreview) {
      setContent((c) => c + before + placeholder + after);
      return;
    }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selectedText = content.slice(start, end) || placeholder;
    const next = content.slice(0, start) + before + selectedText + after + content.slice(end);
    setContent(next);
    requestAnimationFrame(() => {
      try {
        ta.focus();
        const pos = start + before.length + selectedText.length + after.length;
        ta.setSelectionRange(pos, pos);
      } catch (e) {}
    });
  };

  const insertBookLink = (bookId) => {
    setBookPick("");
    const b = books.find((x) => String(x.id) === String(bookId));
    if (!b) return;
    wrap(`[${b.title}](/book/${b.slug || b.id})`);
  };

  // ---------- SEO checklist ----------
  const words = countWords(content);
  const readMins = Math.max(1, Math.ceil(words / 200));
  const checks = [
    { ok: title.trim().length >= 25 && title.trim().length <= 70, text: `Title ${title.trim().length} akshar (25-70 theek)` },
    { ok: description.trim().length >= 120 && description.trim().length <= 160, text: `Description ${description.trim().length} akshar (120-160 theek)` },
    { ok: words >= 600, text: `${words} shabd (600+ achha)` },
    { ok: /(^|\n)## /.test(content), text: "Kam se kam ek ## heading" },
    { ok: content.includes("/book/"), text: "Kam se kam ek book ka link" },
    { ok: SLUG_RE.test(slug) && slug.length <= 60, text: "Slug chhota aur sahi (a-z, 0-9, -)" },
  ];
  const score = checks.filter((c) => c.ok).length;

  // ---------- save ----------
  const save = async (publish) => {
    const t = title.trim();
    const s = slug.trim();
    if (!t) return notify("Title zaroori hai", "error");
    if (!SLUG_RE.test(s)) return notify("Slug sirf a-z, 0-9 aur - se bana ho (jaise paise-bachane-ke-tareeke)", "error");
    if (!content.trim()) return notify("Article ka text khali hai", "error");
    if (publish && publishAt && isNaN(new Date(publishAt).getTime())) return notify("Publish date sahi nahi hai", "error");

    const payload = {
      title: t,
      slug: s,
      description: description.trim() || null,
      content,
      published: publish,
    };

    if (publish) {
      if (publishAt) payload.published_at = new Date(publishAt).toISOString();
      else if (editingPost && statusOf(editingPost) === "published") payload.published_at = editingPost.published_at;
      else payload.published_at = new Date().toISOString();
    }

    setSaving(true);
    try {
      const res = editingId
        ? await supabase.from("posts").update(payload).eq("id", editingId)
        : await supabase.from("posts").insert([payload]);
      if (res.error) {
        if (res.error.code === "23505") notify("Ye slug pehle se kisi aur article me hai. Slug badlo.", "error");
        else notify("Save nahi hua: " + res.error.message, "error");
        setSaving(false);
        return;
      }
      const isFuture = publish && new Date(payload.published_at) > new Date();
      notify(!publish ? "Draft save ho gaya 📝" : isFuture ? "Article schedule ho gaya ⏰" : "Article live ho gaya 🚀", "success");
      await loadPosts();
      setEditorOpen(false);
    } catch (e) {
      notify("Error: " + e.message, "error");
    }
    setSaving(false);
  };

  // ---------- list actions ----------
  const togglePublish = async (p) => {
    const st = statusOf(p);
    const patch = st === "draft" ? { published: true, published_at: new Date().toISOString() } : { published: false };
    const { error } = await supabase.from("posts").update(patch).eq("id", p.id);
    if (error) return notify("Update nahi hua: " + error.message, "error");
    notify(st === "draft" ? "Article live ho gaya 🚀" : "Article draft me gaya", "success");
    loadPosts();
  };

  const duplicatePost = async (p) => {
    const copySlug = `${(p.slug || "article").slice(0, 55)}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await supabase.from("posts").insert([
      { title: `${p.title} (copy)`, slug: copySlug, description: p.description, content: p.content, published: false },
    ]);
    if (error) return notify("Duplicate nahi hua: " + error.message, "error");
    notify("Copy draft me ban gayi", "success");
    loadPosts();
  };

  const deletePost = async (p) => {
    if (!window.confirm(`"${p.title}" hamesha ke liye delete karna hai?`)) return;
    const { error } = await supabase.from("posts").delete().eq("id", p.id);
    if (error) return notify("Delete nahi hua: " + error.message, "error");
    setSelected((s) => s.filter((id) => id !== p.id));
    notify("Article delete ho gaya 🗑️", "success");
    loadPosts();
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copy ho gaya ✅", "success");
    } catch (e) {
      notify("Copy nahi hua", "error");
    }
  };

  // ---------- bulk ----------
  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.includes(p.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelected((s) => s.filter((id) => !visible.some((p) => p.id === id)));
    else setSelected((s) => Array.from(new Set([...s, ...visible.map((p) => p.id)])));
  };
  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkPublish = async () => {
    const ids = posts.filter((p) => selected.includes(p.id) && statusOf(p) === "draft").map((p) => p.id);
    if (!ids.length) return notify("Chune hue articles me koi draft nahi hai", "error");
    const { error } = await supabase.from("posts").update({ published: true, published_at: new Date().toISOString() }).in("id", ids);
    if (error) return notify("Bulk publish nahi hua: " + error.message, "error");
    notify(`${ids.length} article live ho gaye 🚀`, "success");
    setSelected([]);
    loadPosts();
  };

  const bulkDraft = async () => {
    const ids = posts.filter((p) => selected.includes(p.id) && statusOf(p) !== "draft").map((p) => p.id);
    if (!ids.length) return notify("Chune hue articles pehle se draft hain", "error");
    const { error } = await supabase.from("posts").update({ published: false }).in("id", ids);
    if (error) return notify("Bulk draft nahi hua: " + error.message, "error");
    notify(`${ids.length} article draft me gaye`, "success");
    setSelected([]);
    loadPosts();
  };

  const bulkDelete = async () => {
    if (!selected.length) return;
    if (!window.confirm(`${selected.length} article hamesha ke liye delete karne hain?`)) return;
    const { error } = await supabase.from("posts").delete().in("id", selected);
    if (error) return notify("Bulk delete nahi hua: " + error.message, "error");
    notify(`${selected.length} article delete ho gaye 🗑️`, "success");
    setSelected([]);
    loadPosts();
  };

  const inputCls = "w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition";
  const toolBtn = "px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-slate-900/50 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
        <div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">📝 Blog Manager</h2>
          <p className="text-indigo-300 text-sm mt-1">Article likho, schedule karo, edit karo, live ya draft karo.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black px-6 py-3 rounded-xl transition shadow-[0_0_20px_rgba(139,92,246,0.4)]"
        >
          + Naya Article
        </button>
      </div>

      {/* Stats + filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "all", label: "Total", color: "text-white" },
          { id: "published", label: "Live", color: "text-green-300" },
          { id: "scheduled", label: "Scheduled", color: "text-blue-300" },
          { id: "draft", label: "Drafts", color: "text-slate-300" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            className={`text-left p-4 rounded-2xl border transition ${filter === s.id ? "bg-indigo-500/20 border-blue-400/70" : "bg-slate-900/60 border-indigo-500/20 hover:border-indigo-400/50"}`}
          >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{counts[s.id]}</p>
          </button>
        ))}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Title ya slug se dhoondho..."
        className="w-full bg-slate-900/60 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-5 py-4 text-white placeholder-slate-400 outline-none transition"
      />

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-indigo-500/15 border border-indigo-400/40 rounded-2xl p-3">
          <span className="text-sm font-bold text-indigo-200 px-2">{selected.length} chune hue</span>
          <button onClick={bulkPublish} className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-bold">Live karo</button>
          <button onClick={bulkDraft} className="px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold">Draft me bhejo</button>
          <button onClick={bulkDelete} className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold">Delete</button>
          <button onClick={() => setSelected([])} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold ml-auto">Hatao</button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-slate-400 text-center py-10">Load ho raha hai...</p>
      ) : loadError ? (
        <div className="bg-red-900/30 border border-red-500/40 rounded-2xl p-5 text-sm text-red-200 space-y-2">
          <p className="font-bold">Articles load nahi hue:</p>
          <p className="font-mono text-xs break-words">{loadError}</p>
          <p className="text-red-300">Check karo: Supabase me 6-blog-posts.sql aur 10-admin-security.sql chali hain, aur aapka email admins table me hai.</p>
          <button onClick={loadPosts} className="mt-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold">Dobara try karo</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-10 text-center">
          <p className="text-slate-300 font-bold">{posts.length === 0 ? "Abhi koi article nahi hai." : "Is filter me koi article nahi mila."}</p>
          {posts.length === 0 && <button onClick={openNew} className="mt-4 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">Pehla article likho</button>}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="flex items-center gap-3 px-2 text-xs font-bold text-slate-400 cursor-pointer">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-500" />
            Sabhi chuno ({visible.length})
          </label>
          {visible.map((p) => {
            const st = statusOf(p);
            const url = `${SITE_URL}/blog/${p.slug}`;
            return (
              <div key={p.id} className="bg-slate-900/70 border border-indigo-500/20 hover:border-blue-400/50 rounded-2xl p-4 sm:p-5 transition">
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected.includes(p.id)} onChange={() => toggleSelect(p.id)} className="mt-1.5 w-4 h-4 accent-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-1 rounded border ${STATUS_STYLE[st]}`}>{STATUS_LABEL[st]}</span>
                      <span className="text-xs text-slate-500">{st === "draft" ? "Bana: " + formatDate(p.created_at) : (st === "scheduled" ? "Live hoga: " : "Live: ") + formatDate(p.published_at)}</span>
                    </div>
                    <h3 className="text-lg font-black text-white mt-2 break-words">{p.title}</h3>
                    <p className="text-xs font-mono text-indigo-300 mt-1 break-all">/blog/{p.slug}</p>
                    <p className="text-xs text-slate-500 mt-1">{countWords(p.content)} shabd</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => openEdit(p)} className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">✏️ Edit</button>
                  <button onClick={() => togglePublish(p)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">{st === "draft" ? "🚀 Live karo" : "⏸️ Draft me bhejo"}</button>
                  {st === "published" && <a href={url} target="_blank" rel="noopener noreferrer" className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">👁️ Dekho</a>}
                  <button onClick={() => copyText(url)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">🔗 Link copy</button>
                  <button onClick={() => duplicatePost(p)} className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">📄 Duplicate</button>
                  <button onClick={() => deletePost(p)} className="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-500 text-white text-xs font-bold ml-auto">🗑️ Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm overflow-y-auto">
          <div className="min-h-full flex items-start sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full max-w-4xl bg-slate-900 border border-indigo-500/40 sm:rounded-3xl p-5 sm:p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-5 border-b border-indigo-500/20 pb-4">
                <h3 className="text-xl sm:text-2xl font-black text-white">{editingId ? "Article Edit karo" : "Naya Article"}</h3>
                <button onClick={closeEditor} className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold">✕ Band</button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Title *</label>
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!slugTouched) setSlug(slugify(e.target.value));
                    }}
                    type="text"
                    className={inputCls}
                    placeholder="Paise bachane ke 7 aasan tareeke"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Slug (link ka hissa) *</label>
                  <div className="flex gap-2">
                    <input
                      value={slug}
                      onChange={(e) => { setSlug(e.target.value.toLowerCase()); setSlugTouched(true); }}
                      type="text"
                      className={inputCls + " font-mono text-sm"}
                      placeholder="paise-bachane-ke-tareeke"
                    />
                    <button
                      type="button"
                      onClick={() => { setSlug(slugify(title) || `article-${Date.now().toString(36)}`); setSlugTouched(true); }}
                      className={toolBtn + " whitespace-nowrap"}
                    >
                      Auto
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 break-all">{SITE_URL}/blog/{slug || "..."}</p>
                  {editingPost && editingPost.published && slug !== editingPost.slug && (
                    <p className="text-xs text-amber-400 mt-1">⚠️ Live article ka slug badalne se purana link band ho jayega (Google me ho to bhi).</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Description (Google me dikhega, 120-160 akshar)</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls + " h-20 resize-none"} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Article *</label>
                    <button type="button" onClick={() => setShowPreview((v) => !v)} className={toolBtn}>{showPreview ? "✏️ Likhna" : "👁️ Preview"}</button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <button type="button" onClick={() => wrap("\n\n## ", "\n\n", "Bada heading")} className={toolBtn}>H2</button>
                    <button type="button" onClick={() => wrap("\n\n### ", "\n\n", "Chhota heading")} className={toolBtn}>H3</button>
                    <button type="button" onClick={() => wrap("\n\n- ", "\n- Point 2\n\n", "Point 1")} className={toolBtn}>• List</button>
                    <button type="button" onClick={() => wrap("[", "](https://)", "link ka text")} className={toolBtn}>🔗 Link</button>
                    <select
                      value={bookPick}
                      onChange={(e) => insertBookLink(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-xs font-bold text-slate-200 max-w-[11rem]"
                    >
                      <option value="">📚 Book link jodo</option>
                      {books.map((b) => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>

                  {showPreview ? (
                    <div className="bg-slate-950/60 border border-indigo-500/20 rounded-xl p-5 min-h-[18rem]">
                      <h1 className="text-2xl font-black text-white mb-4">{title || "Title yahan dikhega"}</h1>
                      {renderPreview(content)}
                    </div>
                  ) : (
                    <textarea
                      ref={taRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className={inputCls + " h-80 leading-7"}
                      placeholder={"Pehla paragraph yahan likho.\n\n## Pehla heading\n\nIska matlab..."}
                    />
                  )}
                  <p className="text-xs text-slate-500 mt-1">{words} shabd • ~{readMins} min padhne me • Naya paragraph = ek khali line chhodo</p>
                </div>

                {/* SEO checklist */}
                <div className="bg-slate-800/40 border border-indigo-500/20 rounded-2xl p-4">
                  <p className="text-xs font-black text-indigo-300 uppercase tracking-wider mb-3">SEO check: {score}/{checks.length}</p>
                  <ul className="space-y-1.5">
                    {checks.map((c, i) => (
                      <li key={i} className={`text-sm flex items-start gap-2 ${c.ok ? "text-green-300" : "text-amber-300"}`}>
                        <span>{c.ok ? "✅" : "⚠️"}</span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Schedule */}
                <div>
                  <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Publish time (khali = abhi live)</label>
                  <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={inputCls} />
                  <p className="text-xs text-slate-500 mt-1">Bhavishya ki date daloge to article tab tak public nahi dikhega (site par 10 minute tak der lag sakti hai).</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-indigo-500/20">
                  <button
                    onClick={() => save(true)}
                    disabled={saving}
                    className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition"
                  >
                    {saving ? "Save ho raha hai..." : publishAt ? "⏰ Schedule karo" : "🚀 Publish karo"}
                  </button>
                  <button
                    onClick={() => save(false)}
                    disabled={saving}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-black py-4 rounded-xl transition"
                  >
                    📝 Draft save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
