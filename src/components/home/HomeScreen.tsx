"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bookmark,
  Forward,
  Heart,
  House,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  User,
  X,
} from "lucide-react";

/* ---------- demo data (UI only; replaced by backend data later) ---------- */

const PALETTES = [
  ["#f472b6", "#7c3aed"],
  ["#34d399", "#0ea5e9"],
  ["#60a5fa", "#6366f1"],
  ["#fbbf24", "#f97316"],
  ["#a78bfa", "#ec4899"],
  ["#94a3b8", "#475569"],
];

const STORIES = [
  { name: "Sarah", tone: 0, badge: true },
  { name: "Simon", tone: 1 },
  { name: "Mike", tone: 2 },
  { name: "Chloe", tone: 3 },
  { name: "Ben", tone: 5 },
  { name: "Aisha", tone: 4 },
  { name: "Leo", tone: 1 },
];

const SUGGESTED = [
  { id: "jessica_chen", name: "Jessica_Chen", sub: "Jessica Chen", tone: 0 },
  { id: "david_l", name: "David_L", sub: "Profile", tone: 5 },
];

const TOP_STORIES = [
  "Sarah_J – Sunset Vibes, Barcelona",
  "Top film is dropping a new trailer",
  "Mike – Amazing view!",
];

const ALL_USERS = [
  { name: "Liam_Smith", tone: 2 },
  { name: "Mia_Jones", tone: 0 },
  { name: "Jessica_Chen", tone: 0 },
  { name: "David_L", tone: 5 },
  { name: "Chloe_K", tone: 3 },
  { name: "Simon_O", tone: 1 },
];

const POSTS = [
  {
    id: "p1",
    user: "sarah_j",
    tone: 0,
    time: "1hr ago",
    place: "Barcelona",
    caption: "Sunset vibes 🌅",
    sky: ["#312e81", "#f97316", "#fde68a"],
    likes: 1245,
    comments: 89,
    shares: 45,
    comment: { user: "Mike_R", tone: 2, text: "Amazing view!" },
  },
  {
    id: "p2",
    user: "chloe_k",
    tone: 3,
    time: "3hr ago",
    place: "Lisbon",
    caption: "Golden hour on the rooftop ✨",
    sky: ["#1e3a8a", "#ec4899", "#fcd34d"],
    likes: 832,
    comments: 41,
    shares: 12,
    comment: { user: "Simon_O", tone: 1, text: "Take me there!" },
  },
];

const NAV = [
  { label: "Home", href: "/", icon: House, active: true },
  { label: "Explore", href: "/explore", icon: Search },
  { label: "Messages", href: "/messages", icon: MessageCircle, badge: "7" },
  { label: "Saved", href: "#", icon: Bookmark, badge: "3" },
  { label: "Profile", href: "#", icon: User },
];

/* ---------- small pieces ---------- */

function Avatar({ name, tone, size = 44 }: { name: string; tone: number; size?: number }) {
  const [a, b] = PALETTES[tone % PALETTES.length];
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full font-semibold text-white"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: `linear-gradient(135deg, ${a}, ${b})`,
      }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function Scene({ id, sky }: { id: string; sky: string[] }) {
  return (
    <svg viewBox="0 0 600 260" className="h-full w-full" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Landscape photo">
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.6" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
      </defs>
      <rect width="600" height="260" fill={`url(#sky-${id})`} />
      <circle cx="300" cy="140" r="34" fill="#fff7d6" opacity="0.95" />
      <path d="M0 190 L90 130 L170 175 L260 120 L350 180 L440 125 L520 170 L600 140 L600 260 L0 260Z" fill="#4a3263" />
      <path d="M0 215 L110 165 L210 205 L320 160 L430 210 L530 170 L600 200 L600 260 L0 260Z" fill="#1d1b3a" />
    </svg>
  );
}

function StoryRing({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full p-[3px]" style={{ background: "linear-gradient(135deg,#8b5cf6,#3b82f6,#ec4899)" }}>
      <div className="rounded-full bg-[#0a0f1e] p-[2px]">{children}</div>
    </div>
  );
}

const glass = "border border-white/10 bg-white/[0.04] backdrop-blur-xl";

/* ---------- screen ---------- */

export default function HomeScreen() {
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    return term ? ALL_USERS.filter((u) => u.name.toLowerCase().includes(term)) : ALL_USERS.slice(0, 2);
  }, [q]);

  const toggle = (set: Set<string>, id: string, fn: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    fn(next);
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-[#070b16] text-slate-100">
      {/* soft background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 55% 100%, rgba(249,115,22,.28), transparent 70%), radial-gradient(45% 40% at 90% 95%, rgba(168,85,247,.22), transparent 70%), radial-gradient(40% 30% at 8% 0%, rgba(59,130,246,.18), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex h-full max-w-[1440px]">
        {/* ===== left sidebar ===== */}
        <aside className={`${glass} hidden w-[270px] shrink-0 flex-col px-4 py-6 lg:flex`}>
          <Link href="/" className="mb-8 block px-2">
            <Image src="/logo.png" alt="Connect" width={180} height={36} priority className="h-9 w-auto" />
          </Link>

          <nav className="space-y-1">
            {NAV.map(({ label, href, icon: Icon, badge, active }) => (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] transition ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="flex-1">{label}</span>
                {badge && (
                  <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/15 px-1.5 text-xs font-medium">
                    {badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          <div className="my-5 border-t border-white/10" />

          <Link href="#" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-slate-300 transition hover:bg-white/5 hover:text-white">
            <Plus size={20} /> Create Post
          </Link>
          <Link href="#" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-slate-300 transition hover:bg-white/5 hover:text-white">
            <Settings size={20} /> Settings
          </Link>
        </aside>

        {/* ===== centre column ===== */}
        <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-28 pt-6 lg:px-8 lg:pb-10">
          <div className="mb-4 flex items-center justify-between lg:hidden">
            <Image src="/logo.png" alt="Connect" width={180} height={36} className="h-8 w-auto" />
          </div>

          <h2 className="mb-4 text-lg font-semibold">Connect Stories</h2>
          <div className="mb-6 flex gap-5 overflow-x-auto pb-2">
            <button type="button" className="flex shrink-0 flex-col items-center gap-2">
              <span className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10">
                <Plus size={28} />
              </span>
              <span className="text-sm text-slate-300">Create Story</span>
            </button>
            {STORIES.map((s) => (
              <button key={s.name} type="button" className="flex shrink-0 flex-col items-center gap-2">
                <div className="relative">
                  <StoryRing>
                    <Avatar name={s.name} tone={s.tone} size={64} />
                  </StoryRing>
                  {s.badge && (
                    <span className="absolute bottom-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 ring-2 ring-[#0a0f1e]">
                      <Plus size={12} />
                    </span>
                  )}
                </div>
                <span className="text-sm text-slate-300">{s.name}</span>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {POSTS.map((p) => {
              const isLiked = liked.has(p.id);
              return (
                <article key={p.id} className={`${glass} rounded-3xl p-4 shadow-[0_8px_40px_rgba(0,0,0,.35)]`}>
                  <header className="flex items-center gap-3">
                    <StoryRing>
                      <Avatar name={p.user} tone={p.tone} size={40} />
                    </StoryRing>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px]">
                        <span className="font-semibold">{p.user}</span>
                        <span className="text-slate-400"> · {p.time} · {p.place}</span>
                      </p>
                      <p className="text-[15px] text-slate-200">{p.caption}</p>
                    </div>
                    <button type="button" aria-label="More options" className="rounded-full p-2 text-slate-400 hover:bg-white/5">
                      <MoreHorizontal size={20} />
                    </button>
                  </header>

                  <div className="mt-3 h-56 overflow-hidden rounded-2xl sm:h-64">
                    <Scene id={p.id} sky={p.sky} />
                  </div>

                  <div className="mt-3 flex items-center justify-around text-[15px]">
                    <button
                      type="button"
                      onClick={() => toggle(liked, p.id, setLiked)}
                      className={`flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-white/5 ${isLiked ? "text-rose-400" : "text-blue-400"}`}
                    >
                      <Heart size={22} fill="currentColor" />
                      {(p.likes + (isLiked ? 1 : 0)).toLocaleString()}
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-white/5">
                      <MessageCircle size={22} /> {p.comments}
                    </button>
                    <button type="button" className="flex items-center gap-2 rounded-full px-3 py-1.5 text-purple-400 transition hover:bg-white/5">
                      <Forward size={22} /> {p.shares}
                    </button>
                  </div>

                  <div className="mt-3 flex items-start gap-3 border-t border-white/10 pt-3">
                    <Avatar name={p.comment.user} tone={p.comment.tone} size={32} />
                    <p className="text-[15px]">
                      <span className="font-semibold">{p.comment.user}</span>
                      <span className="text-slate-400"> commented:</span>
                      <br />
                      {p.comment.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </main>

        {/* ===== right rail ===== */}
        <aside className={`${glass} hidden w-[350px] shrink-0 overflow-y-auto rounded-3xl p-5 xl:my-4 xl:mr-4 xl:block`}>
          <h3 className="mb-4 text-lg font-semibold">Suggested Connects</h3>
          <ul className="space-y-4">
            {SUGGESTED.map((u) => {
              const on = following.has(u.id);
              return (
                <li key={u.id} className="flex items-center gap-3">
                  <Avatar name={u.name} tone={u.tone} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{u.name}</p>
                    <p className="truncate text-sm text-slate-400">{u.sub}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(following, u.id, setFollowing)}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${
                      on ? "border border-white/15 bg-white/5 text-slate-200" : "text-white hover:brightness-110"
                    }`}
                    style={on ? undefined : { background: "linear-gradient(180deg,#3b82f6,#2563eb)" }}
                  >
                    {on ? "Following" : "Follow"}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="my-5 border-t border-white/10" />

          <h3 className="mb-3 text-lg font-semibold">Top Stories</h3>
          <ul
            className="space-y-3 text-sm text-slate-300"
            style={{ maskImage: "linear-gradient(to bottom,#000 30%,transparent)", WebkitMaskImage: "linear-gradient(to bottom,#000 30%,transparent)" }}
          >
            {TOP_STORIES.map((t, i) => (
              <li key={t} className="flex items-center gap-3">
                <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `linear-gradient(135deg, ${PALETTES[i + 1][0]}, ${PALETTES[i + 1][1]})` }} />
                {t}
              </li>
            ))}
          </ul>

          <div className="my-5 border-t border-white/10" />

          <h3 className="mb-3 text-lg font-semibold">Search Users</h3>
          <div
            className="flex items-center gap-2 rounded-xl bg-[#0a0f1e] px-3 py-2.5"
            style={{ border: "1.5px solid transparent", backgroundImage: "linear-gradient(#0a0f1e,#0a0f1e), linear-gradient(90deg,#3b82f6,#a855f7)", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}
          >
            <Search size={18} className="text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Find users by username..."
              aria-label="Search users"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-slate-500"
            />
            {q && (
              <button type="button" aria-label="Clear search" onClick={() => setQ("")} className="rounded-full bg-white/15 p-1 text-slate-300">
                <X size={12} />
              </button>
            )}
          </div>

          <ul className="mt-3 space-y-1">
            {results.map((u) => (
              <li key={u.name} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
                <Avatar name={u.name} tone={u.tone} size={40} />
                <span>{u.name}</span>
              </li>
            ))}
            {results.length === 0 && <li className="px-2 py-2 text-sm text-slate-400">No users found.</li>}
          </ul>
        </aside>
      </div>

      {/* ===== mobile bottom nav ===== */}
      <nav className={`${glass} fixed inset-x-0 bottom-0 z-10 flex justify-around px-2 py-2 lg:hidden`}>
        {NAV.map(({ label, href, icon: Icon, active }) => (
          <Link key={label} href={href} aria-label={label} className={`rounded-xl p-3 ${active ? "bg-white/10 text-white" : "text-slate-400"}`}>
            <Icon size={22} />
          </Link>
        ))}
      </nav>
    </div>
  );
}