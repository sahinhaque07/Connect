'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CircleDashed, Newspaper, Plus, Search, Settings, User, MessageCircle } from 'lucide-react'
import { actions, activeStories, ago, useDB, useHydrated, type User as U } from '@/lib/store'
import AuthForm from './AuthForm'
import { Avatar, card } from './ui'

function Rail({ me }: { me: U }) {
  const db = useDB(), [q, setQ] = useState('')
  const term = q.trim().toLowerCase().replace('@', '')
  const sug = db.users.filter(u => u.id !== me.id && !me.follows.includes(u.id)).slice(0, 3)
  const top = activeStories(db).slice(-3).reverse()
  const found = term ? db.users.filter(u => u.id !== me.id && u.username.includes(term)).slice(0, 4) : []
  const name = (id: string) => db.users.find(u => u.id === id)
  return (
    <div>
      <div className={card}>
        <h3 className="mb-3 text-lg font-semibold">Suggested Connects</h3>
        {sug.map(u => (
          <div key={u.id} className="mb-3 flex items-center gap-3">
            <Link href={`/u/${u.username}`} className="flex flex-1 items-center gap-3">
              <Avatar name={u.name} size={42} /><div><b className="text-sm">{u.username}</b><div className="text-xs text-mute">{u.name}</div></div></Link>
            <button className="rounded-lg bg-brand px-4 py-1.5 text-sm font-semibold" onClick={() => actions.follow(u.id)}>Follow</button>
          </div>
        ))}
        {!sug.length && <p className="text-sm text-mute">You follow everyone here.</p>}
      </div>
      <div className={card}>
        <h3 className="mb-3 text-lg font-semibold">Top Stories</h3>
        {top.map(s => (
          <Link key={s.id} href="/stories" className="mb-2 flex items-center gap-3 text-sm">
            <img src={s.img} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <span>@{name(s.by)?.username}<span className="block text-xs text-mute">{ago(s.t)}</span></span></Link>
        ))}
        {!top.length && <p className="text-sm text-mute">No stories yet.</p>}
      </div>
      <div className={card}>
        <h3 className="mb-3 text-lg font-semibold">Search Users</h3>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-3.5 text-mute" />
          <input className="w-full rounded-xl border border-brand/60 bg-white/[0.06] py-2.5 pl-9 pr-3 outline-none" placeholder="Find users by username…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {found.map(u => (
          <Link key={u.id} href={`/u/${u.username}`} className="mt-2 flex items-center gap-3 rounded-lg p-2 hover:bg-white/10">
            <Avatar name={u.name} size={34} /><b className="text-sm">{u.username}</b></Link>
        ))}
        {term && !found.length && <p className="mt-2 text-sm text-mute">No one matches that username.</p>}
      </div>
    </div>
  )
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const ready = useHydrated(), db = useDB(), path = usePathname()
  if (!ready) return null
  const me = db.users.find(u => u.id === db.me)
  if (!me) return <AuthForm />
  const unseen = new Set(activeStories(db).filter(s => !s.seen.includes(me.id) && (s.by === me.id || me.follows.includes(s.by))).map(s => s.by)).size
  const items = [
    ['/', 'Feed', Newspaper, 0], ['/explore', 'Explore', Search, 0], ['/messages', 'Messages', MessageCircle, 0],
    ['/stories', 'Stories', CircleDashed, unseen], [`/u/${me.username}`, 'Profile', User, 0],
  ] as const
  const more = [['/create', 'Create Post', Plus], ['/settings', 'Settings', Settings]] as const
  const on = (h: string) => (h === '/' ? path === '/' : path.startsWith(h))
  const link = (h: string) => `flex items-center gap-3 rounded-xl px-4 py-3 font-medium ${on(h) ? 'bg-white/10 text-white' : 'text-mute hover:bg-white/5'}`
  return (
    <div className="min-h-screen md:grid md:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr_330px]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r border-white/10 bg-black/20 p-4 backdrop-blur-md md:flex">
        <img src="/logo.png" alt="Connect" className="mb-6 mt-2 h-9 w-auto self-start px-2" />
        {items.map(([h, l, Icon, n]) => (
          <Link key={h} href={h} className={link(h)}><Icon size={20} />{l}
            {n > 0 && <span className="ml-auto grid h-6 min-w-6 place-items-center rounded-full bg-white/20 px-1.5 text-xs">{n}</span>}</Link>
        ))}
        <div className="my-2 border-t border-white/10" />
        {more.map(([h, l, Icon]) => <Link key={h} href={h} className={link(h)}><Icon size={20} />{l}</Link>)}
      </aside>
      <main className="mx-auto w-full max-w-2xl p-4 pb-24 md:pb-6">
        <img src="/logo.png" alt="Connect" className="mb-4 h-8 w-auto md:hidden" />
        {children}
      </main>
      <aside className="hidden p-4 xl:block"><Rail me={me} /></aside>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-white/10 bg-[#0d1224]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {[...items, ...more.slice(0, 1)].map(([h, l, Icon]) => (
          <Link key={h} href={h} aria-label={l} className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] ${on(h) ? 'text-sky-300' : 'text-mute'}`}><Icon size={20} />{l.split(' ')[0]}</Link>
        ))}
      </nav>
    </div>
  )
}