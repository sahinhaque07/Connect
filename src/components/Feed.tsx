'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bookmark, ChevronLeft, ChevronRight, Heart, ImagePlus, MapPin, MessageCircle, MoreHorizontal, Plus, Send, Smile } from 'lucide-react'
import { actions, activeStories, ago, likeCount, pick, useDB, type Post } from '@/lib/store'
import { Avatar, btn, card, field, ghost } from './ui'

const short = (t: number) => {
  const m = (Date.now() - t) / 6e4
  return m < 1 ? 'now' : m < 60 ? `${Math.floor(m)}m` : m < 1440 ? `${Math.floor(m / 60)}h` : m < 10080 ? `${Math.floor(m / 1440)}d` : `${Math.floor(m / 10080)}w`
}

export function Stories({ grid }: { grid?: boolean }) {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [view, setView] = useState<{ by: string; i: number } | null>(null)
  const list = activeStories(db)
  const ids = [me.id, ...me.follows].filter(id => list.some(s => s.by === id))
  const of = (id: string) => list.filter(s => s.by === id)
  const cur = view ? of(view.by)[view.i] : null
  const next = () => view && setView(view.i + 1 < of(view.by).length ? { by: view.by, i: view.i + 1 } : null)
  const open = (id: string) => { setView({ by: id, i: 0 }); actions.seen(id) }
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button className="w-[68px] shrink-0 text-center text-xs" onClick={async () => { const [i] = await pick(false); if (i) actions.story(i) }}>
          <div className="mx-auto mb-1 grid h-[62px] w-[62px] place-items-center rounded-full border border-white/30 transition hover:bg-white/10"><Plus /></div>Add Story</button>
        {ids.map(id => {
          const u = db.users.find(x => x.id === id)!, seen = of(id).every(s => s.seen.includes(me.id))
          return (
            <button key={id} className="w-[68px] shrink-0 text-center text-xs transition hover:opacity-90" onClick={() => open(id)}>
              <div className="mx-auto mb-1 w-fit">
                {seen ? <div className="rounded-full border-2 border-line p-[2px]"><Avatar name={u.name} src={u.avatar} size={54} /></div> : <Avatar name={u.name} src={u.avatar} size={58} ring />}
              </div>
              <span className="block truncate">{id === me.id ? 'Your story' : u.username}</span></button>
          )
        })}
      </div>
      {grid && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ids.map(id => (
            <button key={id} className="overflow-hidden rounded-xl border border-line bg-panel text-left" onClick={() => open(id)}>
              <img src={of(id)[0].img} alt="Story" className="h-44 w-full object-cover" />
              <div className="p-2 text-sm">@{db.users.find(u => u.id === id)?.username}<span className="text-mute"> · {of(id).length}</span></div>
            </button>
          ))}
          {!ids.length && <p className="text-mute">No active stories yet. Tap Add Story to share one.</p>}
        </div>
      )}
      {cur && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90" onClick={next}>
          <div className="text-center">
            <p className="mb-2 text-sm">@{db.users.find(u => u.id === cur.by)?.username} · {ago(cur.t)}</p>
            <img src={cur.img} alt="Story" className="max-h-[80vh] max-w-[92vw] rounded-2xl" />
            {cur.by === me.id && <p className="mt-2 text-sm text-mute">Seen by {cur.seen.filter(x => x !== me.id).length}</p>}
          </div>
        </div>
      )}
    </>
  )
}

export function Composer({ onDone }: { onDone?: () => void }) {
  const [cap, setCap] = useState(''), [loc, setLoc] = useState(''), [imgs, setImgs] = useState<string[]>([])
  const post = () => {
    if (!cap.trim() && !imgs.length) return
    actions.post(cap.trim(), imgs, loc); setCap(''); setLoc(''); setImgs([]); onDone?.()
  }
  return (
    <div className={card}>
      <textarea className={`${field} resize-none`} rows={3} placeholder="Write a caption…" value={cap} onChange={e => setCap(e.target.value)} />
      <div className="relative mt-2">
        <MapPin size={16} className="absolute left-3 top-3.5 text-mute" />
        <input className={`${field} !pl-9`} placeholder="Add a location (optional)" maxLength={60} value={loc} onChange={e => setLoc(e.target.value)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{imgs.map((s, i) => <img key={i} src={s} alt="" className="h-16 w-16 rounded-lg object-cover" />)}</div>
      <div className="mt-3 flex justify-between">
        <button className={`${ghost} flex items-center gap-2`} onClick={async () => setImgs(await pick(true))}><ImagePlus size={16} />Photos (max 4)</button>
        <button className={btn} onClick={post}>Share</button>
      </div>
    </div>
  )
}

export function PostCard({ p }: { p: Post }) {
  const db = useDB(), me = db.me!, a = db.users.find(u => u.id === p.by)!
  const liked = p.likes.includes(me), saved = (p.saved ?? []).includes(me)
  const [i, setI] = useState(0), [menu, setMenu] = useState(false), [all, setAll] = useState(false)
  const [t, setT] = useState(''), [burst, setBurst] = useState(false), [copied, setCopied] = useState(false)
  const cm = p.comments ?? [], n = p.imgs.length
  const who = (id: string) => db.users.find(u => u.id === id)?.username ?? 'user'
  const hasStory = activeStories(db).some(s => s.by === p.by)
  const link = () => { navigator.clipboard?.writeText(`${location.origin}/u/${a.username}`); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const dbl = () => { if (!liked) actions.like(p.id); setBurst(true); setTimeout(() => setBurst(false), 800) }
  const send = () => { if (t.trim()) { actions.comment(p.id, t.trim()); setT(''); setAll(true) } }
  return (
    <article className="mb-8 border-b border-line pb-5">
      <div className="mb-3 flex items-center gap-3">
        <Link href={`/u/${a.username}`} className="flex items-center gap-3">
          {hasStory ? <Avatar name={a.name} src={a.avatar} size={34} ring /> : <Avatar name={a.name} src={a.avatar} size={38} />}
          <div className="leading-tight"><b className="text-sm">{a.username}</b><span className="text-sm text-mute"> · {short(p.t)}</span>
            {p.loc && <div className="text-xs">{p.loc}</div>}</div>
        </Link>
        <div className="relative ml-auto">
          <button aria-label="More options" className="p-1 text-white/90 hover:text-mute" onClick={() => setMenu(!menu)}><MoreHorizontal /></button>
          {menu && <>
            <button aria-label="Close menu" className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />
            <div className="absolute right-0 z-20 w-44 overflow-hidden rounded-xl border border-line bg-panel2 text-sm shadow-xl">
              <button className="block w-full px-4 py-3 text-left hover:bg-white/10" onClick={() => { link(); setMenu(false) }}>Copy link</button>
              {p.by === me && <button className="block w-full px-4 py-3 text-left text-rose-400 hover:bg-white/10" onClick={() => actions.delPost(p.id)}>Delete</button>}
            </div>
          </>}
        </div>
      </div>
      {n > 0 && (
        <div className="group relative aspect-[4/5] overflow-hidden rounded-md bg-black" onDoubleClick={dbl}>
          <img src={p.imgs[i]} alt="Post photo" className="h-full w-full select-none object-cover" draggable={false} />
          {burst && <Heart className="pop pointer-events-none absolute left-1/2 top-1/2 -ml-12 -mt-12 text-white drop-shadow-lg" size={96} fill="currentColor" />}
          {n > 1 && <>
            {i > 0 && <button aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70" onClick={() => setI(i - 1)}><ChevronLeft size={18} /></button>}
            {i < n - 1 && <button aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1 hover:bg-black/70" onClick={() => setI(i + 1)}><ChevronRight size={18} /></button>}
            <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">{p.imgs.map((_, k) => <span key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? 'bg-white' : 'bg-white/40'}`} />)}</div>
          </>}
        </div>
      )}
      <div className="mt-3 flex items-center gap-4">
        <button aria-label="Like" onClick={() => actions.like(p.id)} className="transition active:scale-90 hover:text-mute"><Heart size={26} className={liked ? 'text-rose-500' : ''} fill={liked ? 'currentColor' : 'none'} strokeWidth={1.8} /></button>
        <button aria-label="Comments" onClick={() => setAll(!all)} className="transition hover:text-mute"><MessageCircle size={26} strokeWidth={1.8} /></button>
        <button aria-label="Share" onClick={() => { actions.share(p.id); link() }} className="transition hover:text-mute"><Send size={25} strokeWidth={1.8} /></button>
        {copied && <span className="text-xs text-mute">Link copied</span>}
        <button aria-label="Save" onClick={() => actions.save(p.id)} className="ml-auto transition hover:text-mute"><Bookmark size={26} strokeWidth={1.8} fill={saved ? 'currentColor' : 'none'} /></button>
      </div>
      <p className="mt-2 text-sm font-semibold">{likeCount(p) ? `${likeCount(p).toLocaleString()} like${likeCount(p) > 1 ? 's' : ''}` : 'Be the first to like this'}</p>
      {p.cap && <p className="mt-1 whitespace-pre-wrap text-sm"><b>{a.username}</b> {p.cap}</p>}
      {cm.length > 0 && !all && <button className="mt-1 text-sm text-mute" onClick={() => setAll(true)}>View all {cm.length} comment{cm.length > 1 ? 's' : ''}</button>}
      {all && <div className="mt-2 space-y-1 text-sm">{cm.map(c => <p key={c.id}><b>{who(c.by)}</b> {c.body}</p>)}</div>}
      <div className="mt-3 flex items-center gap-2">
        <input className="flex-1 bg-transparent text-sm outline-none placeholder:text-mute" placeholder="Add a comment…" value={t} onChange={e => setT(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        {t.trim() && <button className="text-sm font-semibold text-brand hover:text-white" onClick={send}>Post</button>}
        <button aria-label="Add emoji" className="text-mute hover:text-white" onClick={() => setT(t + '😊')}><Smile size={18} /></button>
      </div>
    </article>
  )
}