'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, ImagePlus, MapPin, MessageCircle, Plus, Share2, Trash2 } from 'lucide-react'
import { actions, activeStories, ago, pick, useDB, type Post } from '@/lib/store'
import { Avatar, btn, card, field, ghost } from './ui'

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
      <h2 className="mb-3 text-lg font-semibold">Connect Stories</h2>
      <div className="mb-4 flex gap-4 overflow-x-auto pb-2">
        <button className="min-w-16 text-center text-xs" onClick={async () => { const [i] = await pick(false); if (i) actions.story(i) }}>
          <div className="mb-1 grid h-16 w-16 place-items-center rounded-full bg-white/10"><Plus /></div>Create Story</button>
        {ids.map(id => {
          const u = db.users.find(x => x.id === id)!, seen = of(id).every(s => s.seen.includes(me.id))
          return (
            <button key={id} className="min-w-16 text-center text-xs" onClick={() => open(id)}>
              <div className={`mb-1 rounded-full p-[3px] ${seen ? 'bg-white/20' : 'bg-gradient-to-tr from-sky-400 via-blue-500 to-fuchsia-500'}`}><Avatar name={u.name} size={58} /></div>
              {id === me.id ? 'You' : u.username}</button>
          )
        })}
      </div>
      {grid && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ids.map(id => (
            <button key={id} className={`${card} !mb-0 overflow-hidden !p-0 text-left`} onClick={() => open(id)}>
              <img src={of(id)[0].img} alt="Story" className="h-44 w-full object-cover" />
              <div className="p-2 text-sm">@{db.users.find(u => u.id === id)?.username}<span className="text-mute"> · {of(id).length}</span></div>
            </button>
          ))}
          {!ids.length && <p className="text-mute">No active stories yet. Tap Create Story to add one.</p>}
        </div>
      )}
      {cur && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/90" onClick={next}>
          <div className="text-center">
            <p className="mb-2">@{db.users.find(u => u.id === cur.by)?.username} · {ago(cur.t)}</p>
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
      <textarea className={`${field} resize-none`} rows={2} placeholder="What’s on your mind?" value={cap} onChange={e => setCap(e.target.value)} />
      <div className="relative mt-2">
        <MapPin size={16} className="absolute left-3 top-3.5 text-mute" />
        <input className={`${field} !pl-9`} placeholder="Add a location (optional)" maxLength={60} value={loc} onChange={e => setLoc(e.target.value)} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">{imgs.map((s, i) => <img key={i} src={s} alt="" className="h-16 w-16 rounded-lg object-cover" />)}</div>
      <div className="mt-3 flex justify-between">
        <button className={`${ghost} flex items-center gap-2`} onClick={async () => setImgs(await pick(true))}><ImagePlus size={16} />Photos (max 4)</button>
        <button className={btn} onClick={post}>Post</button>
      </div>
    </div>
  )
}

export function PostCard({ p }: { p: Post }) {
  const db = useDB(), a = db.users.find(u => u.id === p.by)!, liked = p.likes.includes(db.me!)
  const [open, setOpen] = useState(false), [t, setT] = useState('')
  const cm = p.comments ?? [], last = cm[cm.length - 1]
  const who = (id: string) => db.users.find(u => u.id === id)?.username ?? 'user'
  const send = () => { if (t.trim()) { actions.comment(p.id, t.trim()); setT('') } }
  return (
    <div className={card}>
      <div className="flex items-center gap-3">
        <Link href={`/u/${a.username}`} className="flex items-center gap-3">
          <Avatar name={a.name} />
          <div><b>{a.username}</b><div className="text-xs text-mute">{ago(p.t)}{p.loc ? ` · ${p.loc}` : ''}</div></div></Link>
        {p.by === db.me && <button className="ml-auto text-mute" aria-label="Delete post" onClick={() => actions.delPost(p.id)}><Trash2 size={18} /></button>}
      </div>
      {p.cap && <p className="mt-3 whitespace-pre-wrap">{p.cap}</p>}
      {p.imgs.length > 0 && (
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-1.5">
          {p.imgs.map((s, i) => <img key={i} src={s} alt="Post photo" className="max-h-96 w-full rounded-xl object-cover" />)}
        </div>
      )}
      <div className="mt-3 flex items-center justify-between px-2 font-semibold">
        <button className={`flex items-center gap-1.5 ${liked ? 'text-sky-400' : 'text-mute'}`} onClick={() => actions.like(p.id)}>
          <Heart size={20} fill={liked ? 'currentColor' : 'none'} />{p.likes.length}</button>
        <button className="flex items-center gap-1.5 text-mute" onClick={() => setOpen(!open)}><MessageCircle size={20} />{cm.length}</button>
        <button className="flex items-center gap-1.5 text-fuchsia-400" onClick={() => { actions.share(p.id); navigator.clipboard?.writeText(`${location.origin}/u/${a.username}`) }}>
          <Share2 size={20} />{p.shares ?? 0}</button>
      </div>
      {!open && last && <p className="mt-3 border-t border-white/10 pt-3 text-sm"><b>{who(last.by)}</b> <span className="text-mute">commented:</span> {last.body}</p>}
      {open && (
        <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-sm">
          {cm.map(c => <p key={c.id}><b>{who(c.by)}</b> {c.body}</p>)}
          <input className={field} placeholder="Write a comment…" value={t} onChange={e => setT(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        </div>
      )}
    </div>
  )
}