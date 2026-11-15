'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, LogOut, MessageCircle, Search, User } from 'lucide-react'
import { actions, useDB, useHydrated } from '@/lib/store'
import AuthForm from './AuthForm'
import { Avatar, card, ghost } from './ui'

export default function Shell({ children }: { children: React.ReactNode }) {
  const ready = useHydrated(), db = useDB(), path = usePathname()
  if (!ready) return null
  const me = db.users.find(u => u.id === db.me)
  if (!me) return <AuthForm />
  const items = [
    ['/', 'Home', Home], ['/explore', 'Explore', Compass],
    ['/messages', 'Messages', MessageCircle], [`/u/${me.username}`, 'Profile', User],
  ] as const
  const on = (href: string) => (href === '/' ? path === '/' : path.startsWith(href))
  const suggestions = db.users.filter(u => u.id !== me.id && !me.follows.includes(u.id)).slice(0, 4)
  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-1 border-r border-line bg-side p-4 md:flex">
        <div className="px-3 pb-5 text-2xl font-bold">Connect
          <div className="text-[10px] font-normal text-mute">Share • Explore • Belong</div></div>
        {items.map(([href, label, Icon]) => (
          <Link key={href} href={href}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 font-semibold ${on(href) ? 'bg-brand text-white' : 'text-mute hover:bg-panel'}`}>
            <Icon size={20} />{label}</Link>
        ))}
        <div className="flex-1" />
        <button className="flex items-center gap-3 px-4 py-3 text-mute" onClick={actions.logout}><LogOut size={20} />Log out</button>
      </aside>
      <main className="mx-auto w-full max-w-3xl p-4 pb-24 md:pb-4">
        <Link href="/explore" className="mb-4 flex items-center gap-3 rounded-full border border-line bg-panel px-5 py-3 text-mute">
          <Search size={18} />Search people by username…</Link>
        {children}
      </main>
      <aside className="hidden p-4 xl:block">
        <div className={card}>
          <b>People You May Know</b>
          {suggestions.map(u => (
            <div key={u.id} className="mt-3 flex items-center gap-3">
              <Link href={`/u/${u.username}`} className="flex flex-1 items-center gap-3">
                <Avatar name={u.name} size={38} /><div><b className="text-sm">{u.name}</b><div className="text-xs text-mute">@{u.username}</div></div></Link>
              <button className={ghost} onClick={() => actions.follow(u.id)}>Follow</button>
            </div>
          ))}
          {!suggestions.length && <p className="mt-2 text-sm text-mute">You follow everyone here.</p>}
        </div>
        <p className="text-xs text-mute">© 2026 Connect · Privacy · Terms · Help</p>
      </aside>
      <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-side pb-[env(safe-area-inset-bottom)] md:hidden">
        {items.map(([href, label, Icon]) => (
          <Link key={href} href={href} aria-label={label}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs ${on(href) ? 'text-violet-300' : 'text-mute'}`}><Icon size={20} />{label}</Link>
        ))}
      </nav>
    </div>
  )
}