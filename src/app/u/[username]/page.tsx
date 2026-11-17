'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Bookmark, Camera, Clapperboard, Copy, Grid3x3, Heart, MessageCircle, Plus, Send, Settings, SquareUser, X, type LucideIcon } from 'lucide-react'
import { PostCard } from '@/components/Feed'
import { Avatar, card } from '@/components/ui'
import { actions, activeStories, pick, useDB, type Highlight, type Post } from '@/lib/store'

type Tab = 'posts' | 'reels' | 'saved' | 'tagged'

const pill = 'rounded-lg bg-white/10 px-4 py-1.5 text-sm font-semibold transition hover:bg-white/20'
const primary = 'rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold text-white transition hover:brightness-110'

// Big outlined-circle empty state (same look as the "Save" screen)
function Empty({ icon: Icon, title, text, children }: { icon: LucideIcon; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-[460px] flex-col items-center px-4 py-16 text-center md:py-20">
      <div className="grid h-[78px] w-[78px] place-items-center rounded-full border border-white"><Icon size={36} strokeWidth={1.3} /></div>
      <h2 className="mt-6 text-[28px] font-bold leading-tight">{title}</h2>
      {text && <p className="mt-4 text-base leading-snug">{text}</p>}
      {children}
    </div>
  )
}

function Tile({ p, onOpen }: { p: Post; onOpen: () => void }) {
  return (
    <button aria-label="Open post" onClick={onOpen} className="group relative aspect-[3/4] overflow-hidden bg-panel2 text-left">
      {p.imgs[0]
        ? <img src={p.imgs[0]} alt="" className="h-full w-full object-cover" />
        : <p className="line-clamp-6 p-3 text-sm">{p.cap}</p>}
      {p.imgs.length > 1 && <Copy size={20} className="absolute right-2 top-2 text-white drop-shadow" />}
      <div className="absolute inset-0 hidden items-center justify-center gap-6 bg-black/40 font-bold text-white group-hover:flex">
        <span className="flex items-center gap-1.5"><Heart size={20} fill="currentColor" />{p.likes.length}</span>
        <span className="flex items-center gap-1.5"><MessageCircle size={20} fill="currentColor" />{p.comments?.length ?? 0}</span>
      </div>
    </button>
  )
}

const Grid = ({ list, open }: { list: Post[]; open: (id: string) => void }) => (
  <div className="grid grid-cols-3 gap-0.5 sm:gap-1">{list.map(p => <Tile key={p.id} p={p} onOpen={() => open(p.id)} />)}</div>
)

function Profile({ username }: { username: string }) {
  const db = useDB(), me = db.users.find(x => x.id === db.me)!
  const u = db.users.find(x => x.username === username)
  const [tab, setTab] = useState<Tab>('posts'), [openId, setOpenId] = useState<string | null>(null)
  const [hl, setHl] = useState<Highlight | null>(null), [toast, setToast] = useState('')

  useEffect(() => {
    if (!openId && !hl) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpenId(null); setHl(null) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [openId, hl])

  if (!u) return <div className={card}>That user doesn’t exist.</div>

  const own = u.id === me.id, f = me.follows.includes(u.id)
  const posts = db.posts.filter(p => p.by === u.id)
  const saved = own ? db.posts.filter(p => (p.saved ?? []).includes(me.id)) : []
  const opened = db.posts.find(p => p.id === openId) ?? null
  const hasStory = activeStories(db).some(s => s.by === u.id)
  const highlights = u.highlights ?? []
  const stats: [number, string][] = [[posts.length, 'posts'], [db.users.filter(x => x.follows.includes(u.id)).length, 'followers'], [u.follows.length, 'following']]

  const soon = (m: string) => { setToast(m); setTimeout(() => setToast(''), 1600) }
  const addHighlight = async () => {
    const [img] = await pick(false)
    if (!img) return
    const title = prompt('Highlight name', 'Highlights')
    if (title !== null) actions.highlight(title, img)
  }

  const tabs: { id: Tab; Icon: LucideIcon; label: string }[] = [
    { id: 'posts', Icon: Grid3x3, label: 'Posts' },
    { id: 'reels', Icon: Clapperboard, label: 'Reels' },
    ...(own ? [{ id: 'saved' as const, Icon: Bookmark, label: 'Saved' }] : []),
    { id: 'tagged', Icon: SquareUser, label: 'Tagged' },
  ]

  const about = (
    <>
      <div className="text-sm font-semibold">{u.name}</div>
      {u.bio
        ? <p className="mt-0.5 whitespace-pre-wrap text-sm">{u.bio}</p>
        : own && <Link href="/settings" className="mt-0.5 block text-sm text-mute hover:text-white">Add a bio</Link>}
    </>
  )

  return (
    <>
      {/* ---------- Header ---------- */}
      <header className="flex items-start gap-5 sm:gap-10 md:gap-16">
        <div className="shrink-0 md:flex md:w-[220px] md:justify-center">
          <span className="hidden md:block"><Avatar name={u.name} size={150} ring={hasStory} /></span>
          <span className="md:hidden"><Avatar name={u.name} size={80} ring={hasStory} /></span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <h1 className="truncate text-xl font-semibold">{u.username}</h1>
            {own ? (
              <>
                <Link href="/settings" className={pill}>Edit profile</Link>
                <Link href="/settings" aria-label="Settings" className="p-1 transition hover:text-mute"><Settings size={24} strokeWidth={1.8} /></Link>
              </>
            ) : (
              <>
                <button className={f ? pill : primary} onClick={() => actions.follow(u.id)}>{f ? 'Following' : 'Follow'}</button>
                <Link href={`/messages?with=${u.id}`} className={pill}>Message</Link>
              </>
            )}
          </div>
          <ul className="mt-5 hidden gap-10 text-base md:flex">
            {stats.map(([n, l]) => <li key={l}><b className="font-semibold">{n.toLocaleString()}</b> {l}</li>)}
          </ul>
          <div className="mt-4 hidden md:block">{about}</div>
        </div>
      </header>

      <div className="mt-4 md:hidden">{about}</div>

      {/* ---------- Stats (mobile) ---------- */}
      <ul className="mt-5 grid grid-cols-3 border-y border-line py-3 text-center text-sm md:hidden">
        {stats.map(([n, l]) => <li key={l}><b className="block font-semibold">{n.toLocaleString()}</b><span className="text-mute">{l}</span></li>)}
      </ul>

      {/* ---------- Highlights ---------- */}
      {(own || highlights.length > 0) && (
        <div className="mt-6 flex gap-5 overflow-x-auto pb-2 md:mt-12 md:gap-8 md:px-10 [scrollbar-width:none]">
          {own && (
            <button className="w-[77px] shrink-0 text-center text-xs font-semibold" onClick={addHighlight}>
              <div className="mx-auto mb-2 grid h-[77px] w-[77px] place-items-center rounded-full border border-white/30 bg-panel2 transition hover:bg-white/10"><Plus size={40} strokeWidth={1.2} /></div>
              New
            </button>
          )}
          {highlights.map(h => (
            <div key={h.id} className="group relative w-[77px] shrink-0 text-center text-xs font-semibold">
              <button className="block w-full" onClick={() => setHl(h)}>
                <div className="mx-auto mb-2 h-[77px] w-[77px] rounded-full border border-white/30 p-[3px]"><img src={h.img} alt="" className="h-full w-full rounded-full object-cover" /></div>
                <span className="block truncate">{h.title}</span>
              </button>
              {own && (
                <button aria-label="Delete highlight" className="absolute right-0 top-0 hidden rounded-full bg-black/70 p-1 group-hover:block"
                  onClick={() => confirm('Delete this highlight?') && actions.delHighlight(h.id)}><X size={12} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------- Tabs ---------- */}
      <div className={`mt-8 grid border-b border-line md:mt-10 ${own ? 'grid-cols-4' : 'grid-cols-3'}`} role="tablist">
        {tabs.map(({ id, Icon, label }) => (
          <button key={id} role="tab" aria-selected={tab === id} aria-label={label} onClick={() => setTab(id)} className="flex justify-center">
            <span className={`relative flex px-7 py-3.5 transition ${tab === id ? 'text-white' : 'text-mute hover:text-white'}`}>
              <Icon size={26} strokeWidth={tab === id ? 2.4 : 1.8} />
              {tab === id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-white" />}
            </span>
          </button>
        ))}
      </div>

      {/* ---------- Tab content ---------- */}
      {tab === 'posts' && (posts.length
        ? <Grid list={posts} open={setOpenId} />
        : own
          ? <Empty icon={Camera} title="Share photos" text="When you share photos, they will appear on your profile.">
              <Link href="/create" className="mt-4 text-sm font-semibold text-[#5aa9ff] hover:text-white">Share your first photo</Link>
            </Empty>
          : <Empty icon={Camera} title="No posts yet" />)}

      {tab === 'reels' && <Empty icon={Clapperboard} title="Reels" text="Reels are coming soon to Connect." />}

      {tab === 'saved' && (
        <>
          <div className="flex items-center justify-between gap-4 px-2 py-5 text-sm sm:px-8">
            <span className="text-mute">Only you can see what you’ve saved</span>
            <button className="font-semibold text-[#5aa9ff] transition hover:text-white" onClick={() => soon('Collections are coming soon')}>+ New Collection</button>
          </div>
          {saved.length
            ? <Grid list={saved} open={setOpenId} />
            : <Empty icon={Bookmark} title="Save" text="Save photos and videos that you want to see again. No one is notified, and only you can see what you’ve saved." />}
        </>
      )}

      {tab === 'tagged' && <Empty icon={SquareUser} title="Photos of you" text="When people tag you in photos, they’ll appear here." />}

      {/* ---------- Footer ---------- */}
      <footer className="mt-16 pb-6 text-center text-xs text-mute">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2"><span>About</span><span>Help</span><span>Privacy</span><span>Terms</span><Link href="/settings" className="hover:text-white">Settings</Link></div>
        <p className="mt-4">© 2026 Connect</p>
      </footer>

      {/* ---------- Floating Messages pill (desktop) ---------- */}
      <Link href="/messages" className="fixed bottom-6 right-6 z-30 hidden items-center gap-3 rounded-full border border-line bg-panel2/90 px-6 py-4 font-semibold shadow-lg backdrop-blur transition hover:bg-panel2 md:flex">
        <Send size={24} strokeWidth={1.8} />Messages
      </Link>

      {/* ---------- Post viewer ---------- */}
      {opened && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setOpenId(null)}>
          <button aria-label="Close" className="absolute right-4 top-4 text-white transition hover:text-mute" onClick={() => setOpenId(null)}><X size={30} /></button>
          <div className="max-h-[92vh] w-full max-w-[470px] overflow-y-auto rounded-2xl bg-bg p-4 pb-2" onClick={e => e.stopPropagation()}>
            <PostCard p={opened} />
          </div>
        </div>
      )}

      {/* ---------- Highlight viewer ---------- */}
      {hl && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90" onClick={() => setHl(null)}>
          <div className="text-center">
            <p className="mb-2 text-sm font-semibold">{hl.title}</p>
            <img src={hl.img} alt={hl.title} className="max-h-[80vh] max-w-[92vw] rounded-2xl" />
          </div>
        </div>
      )}

      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-lg md:bottom-8">{toast}</div>}
    </>
  )
}

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  // key = username, so tab/modal state resets when you move between profiles
  return <Profile key={username} username={username} />
}