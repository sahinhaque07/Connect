'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Copy, Heart, MessageCircle, Search, X } from 'lucide-react'
import { PostCard } from '@/components/Feed'
import { Avatar, ghost } from '@/components/ui'
import { actions, likeCount, useDB, type Post } from '@/lib/store'

const TOPICS = ['All', 'Travel', 'Food', 'Nature', 'Art', 'Fitness', 'Tech', 'City']

function Tile({ p, big, right, onOpen }: { p: Post; big: boolean; right: boolean; onOpen: () => void }) {
  return (
    <button aria-label="Open post" onClick={onOpen}
      className={`group relative overflow-hidden bg-panel2 ${big ? `col-span-2 row-span-2 ${right ? 'col-start-2' : ''}` : 'aspect-square'}`}>
      <img src={p.imgs[0]} alt="" loading="lazy" className={big ? 'absolute inset-0 h-full w-full object-cover' : 'h-full w-full object-cover'} />
      {p.imgs.length > 1 && <Copy size={big ? 24 : 20} className="absolute right-2 top-2 text-white drop-shadow" />}
      <div className="absolute inset-0 hidden items-center justify-center gap-6 bg-black/40 font-bold text-white group-hover:flex">
        <span className="flex items-center gap-1.5"><Heart size={20} fill="currentColor" />{likeCount(p).toLocaleString()}</span>
        <span className="flex items-center gap-1.5"><MessageCircle size={20} fill="currentColor" />{p.comments?.length ?? 0}</span>
      </div>
    </button>
  )
}

export default function ExplorePage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [q, setQ] = useState(''), [topic, setTopic] = useState('All'), [openId, setOpenId] = useState<string | null>(null)
  const term = q.trim().toLowerCase().replace(/^[@#]/, '')

  useEffect(() => {
    if (!openId) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [openId])

  const name = (id: string) => db.users.find(u => u.id === id)?.username ?? ''
  const people = term ? db.users.filter(u => u.id !== me.id && (u.username.includes(term) || u.name.toLowerCase().includes(term))).slice(0, 6) : []
  const list = db.posts
    .filter(p => p.by !== me.id && p.imgs.length)
    .filter(p => term ? p.cap.toLowerCase().includes(term) || name(p.by).includes(term) : topic === 'All' || p.cap.toLowerCase().includes('#' + topic.toLowerCase()))
    .sort((a, b) => likeCount(b) - likeCount(a))
  const opened = db.posts.find(p => p.id === openId) ?? null

  return (
    <>
      {/* ---------- Search ---------- */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
        <input className="w-full rounded-xl bg-panel2 py-3 pl-11 pr-10 text-[15px] outline-none transition placeholder:text-mute focus:ring-1 focus:ring-white/30"
          placeholder="Search people, captions or #topics" value={q} onChange={e => setQ(e.target.value)} />
        {q && <button aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-mute/60 p-0.5 text-black" onClick={() => setQ('')}><X size={14} /></button>}
      </div>

      {/* ---------- Topics ---------- */}
      {!term && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)}
              className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${topic === t ? 'bg-white text-black' : 'bg-white/10 hover:bg-white/20'}`}>{t}</button>
          ))}
        </div>
      )}

      {/* ---------- People results ---------- */}
      {people.length > 0 && (
        <div className="mb-5 space-y-3 rounded-2xl border border-line bg-panel p-4">
          {people.map(u => {
            const f = me.follows.includes(u.id)
            return (
              <div key={u.id} className="flex items-center gap-3">
                <Link href={`/u/${u.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar name={u.name} src={u.avatar} size={44} />
                  <div className="min-w-0 leading-tight"><b className="block truncate text-sm">{u.username}</b><span className="text-xs text-mute">{u.name}</span></div>
                </Link>
                <button className={`${ghost} ${f ? '!bg-brand !text-white' : ''}`} onClick={() => actions.follow(u.id)}>{f ? 'Following' : 'Follow'}</button>
              </div>
            )
          })}
        </div>
      )}

      {/* ---------- Photo grid ---------- */}
      {list.length > 0 ? (
        <div className="grid grid-flow-dense grid-cols-3 gap-0.5 sm:gap-1">
          {list.map((p, i) => (
            <Tile key={p.id} p={p} big={i % 6 === 0 && i + 5 < list.length} right={Math.floor(i / 6) % 2 === 1} onOpen={() => setOpenId(p.id)} />
          ))}
        </div>
      ) : (
        <p className="py-16 text-center text-mute">{term ? `No posts match “${q.trim()}”.` : 'Nothing to explore here yet.'}</p>
      )}

      {/* ---------- Post viewer ---------- */}
      {opened && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4" onClick={() => setOpenId(null)}>
          <button aria-label="Close" className="absolute right-4 top-4 text-white transition hover:text-mute" onClick={() => setOpenId(null)}><X size={30} /></button>
          <div className="max-h-[92vh] w-full max-w-[470px] overflow-y-auto rounded-2xl bg-bg p-4 pb-2" onClick={e => e.stopPropagation()}>
            <PostCard p={opened} />
          </div>
        </div>
      )}
    </>
  )
}