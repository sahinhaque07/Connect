'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Heart, ImagePlus, Plus, Trash2 } from 'lucide-react'
import { actions, activeStories, ago, pick, useDB, type Post } from '@/lib/store'
import { Avatar, btn, card, field, ghost } from './ui'

export function Stories() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [view, setView] = useState<{ by: string; i: number } | null>(null)
  const list = activeStories(db)
  const ids = [me.id, ...me.follows].filter(id => list.some(s => s.by === id))
  const of = (id: string) => list.filter(s => s.by === id)
  const cur = view ? of(view.by)[view.i] : null
  const next = () => view && setView(view.i + 1 < of(view.by).length ? { by: view.by, i: view.i + 1 } : null)
  return (
    <>
      <div className="mb-3 flex gap-4 overflow-x-auto pb-2">
        <button className="min-w-16 text-center text-xs" onClick={async () => { const [i] = await pick(false); if (i) actions.story(i) }}>
          <div className="grid h-16 w-16 place-items-center rounded-full border border-dashed border-mute"><Plus /></div>Create Story</button>
        {ids.map(id => {
          const u = db.users.find(x => x.id === id)!, seen = of(id).every(s => s.seen.includes(me.id))
          return (
            <button key={id} className="min-w-16 text-center text-xs" onClick={() => { setView({ by: id, i: 0 }); actions.seen(id) }}>
              <div className={`rounded-full p-[3px] ${seen ? 'bg-line' : 'bg-gradient-to-tr from-violet-400 to-pink-500'}`}><Avatar name={u.name} size={58} /></div>
              {id === me.id ? 'You' : u.username}</button>
          )
        })}
      </div>
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

export function Composer() {
  const [cap, setCap] = useState(''), [imgs, setImgs] = useState<string[]>([])
  const post = () => { if (!cap.trim() && !imgs.length) return; actions.post(cap.trim(), imgs); setCap(''); setImgs([]) }
  return (
    <div className={card}>
      <textarea className={`${field} resize-none`} rows={2} placeholder="What’s on your mind?" value={cap} onChange={e => setCap(e.target.value)} />
      <div className="mt-2 flex flex-wrap gap-2">{imgs.map((s, i) => <img key={i} src={s} alt="" className="h-16 w-16 rounded-lg object-cover" />)}</div>
      <div className="mt-2 flex justify-between">
        <button className={`${ghost} flex items-center gap-2`} onClick={async () => setImgs(await pick(true))}><ImagePlus size={16} />Photos (max 4)</button>
        <button className={btn} onClick={post}>Post</button>
      </div>
    </div>
  )
}

export function PostCard({ p }: { p: Post }) {
  const db = useDB(), a = db.users.find(u => u.id === p.by)!, liked = p.likes.includes(db.me!)
  return (
    <div className={card}>
      <div className="flex items-center gap-3">
        <Link href={`/u/${a.username}`} className="flex items-center gap-3">
          <Avatar name={a.name} /><div><b>{a.name}</b><div className="text-xs text-mute">@{a.username} · {ago(p.t)}</div></div></Link>
        {p.by === db.me && <button className="ml-auto text-mute" aria-label="Delete post" onClick={() => actions.delPost(p.id)}><Trash2 size={18} /></button>}
      </div>
      {p.cap && <p className="mt-3 whitespace-pre-wrap">{p.cap}</p>}
      {p.imgs.length > 0 && (
        <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-1.5">
          {p.imgs.map((s, i) => <img key={i} src={s} alt="Post photo" className="h-64 w-full rounded-xl object-cover" />)}
        </div>
      )}
      <button className={`mt-3 flex items-center gap-1.5 font-semibold ${liked ? 'text-violet-400' : 'text-mute'}`} onClick={() => actions.like(p.id)}>
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} />{p.likes.length}</button>
    </div>
  )
}