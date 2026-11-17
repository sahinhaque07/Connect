'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Clapperboard, Compass, Heart, House, Menu, MessageCircle, Search, SquarePlus } from 'lucide-react'
import { actions, useDB, useHydrated, type User } from '@/lib/store'
import AuthForm from './AuthForm'
import { Avatar } from './ui'

function Rail({ me }: { me: User }) {
  const db = useDB()
  const sug = db.users.filter(u => u.id !== me.id && !me.follows.includes(u.id)).slice(0, 5)
  return (
    <div className="rounded-2xl bg-side p-4">
      <div className="flex items-center gap-3">
        <Link href={`/u/${me.username}`}><Avatar name={me.name} size={56} /></Link>
        <div className="min-w-0 flex-1 leading-tight"><b className="block truncate text-sm">{me.username}</b><span className="text-sm text-mute">{me.name}</span></div>
        <button className="text-xs font-semibold text-brand hover:text-white" onClick={() => actions.logout()}>Log out</button>
      </div>
      <div className="mb-3 mt-6 flex items-center justify-between text-sm">
        <b className="text-mute">Suggestions for you</b><Link href="/explore" className="text-xs font-semibold hover:text-mute">See All</Link>
      </div>
      <div className="space-y-3">
        {sug.map(u => (
          <div key={u.id} className="flex items-center gap-3">
            <Link href={`/u/${u.username}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar name={u.name} size={44} />
              <div className="min-w-0 leading-tight"><b className="block truncate text-sm">{u.username}</b>
                <span className="text-xs text-mute">{u.follows.includes(me.id) ? 'Follows you' : 'Suggested for you'}</span></div>
            </Link>
            <button className="text-xs font-semibold text-brand hover:text-white" onClick={() => actions.follow(u.id)}>Follow</button>
          </div>
        ))}
        {!sug.length && <p className="text-sm text-mute">You follow everyone here.</p>}
      </div>
      <p className="mt-8 text-[11px] leading-5 text-mute/70">About · Help · Privacy · Terms<br />© 2026 Connect</p>
    </div>
  )
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const ready = useHydrated(), db = useDB(), path = usePathname()
  const [toast, setToast] = useState('')
  if (!ready) return null
  const me = db.users.find(u => u.id === db.me)
  if (!me) return <AuthForm />
  const soon = () => { setToast('Coming soon'); setTimeout(() => setToast(''), 1600) }
  const on = (h: string) => (h === '/' ? path === '/' : !!h && path.startsWith(h))
  const nav = [
    ['/', 'Home', House], ['/explore', 'Search', Search], ['', 'Explore', Compass], ['', 'Reels', Clapperboard],
    ['/messages', 'Messages', MessageCircle], ['', 'Notifications', Heart], ['/create', 'Create', SquarePlus],
  ] as const
  const row = 'group flex w-full items-center gap-4 rounded-lg px-3 py-3 text-[15px] transition hover:bg-white/10'
  const label = (l: string, a: boolean) => <span className={`hidden lg:inline ${a ? 'font-bold' : ''}`}>{l}</span>
  const profile = `/u/${me.username}`
  const wide = path.startsWith('/messages')
  const profilePage = path.startsWith('/u/')
  const noRail = wide || profilePage
  return (
    <div className={`min-h-screen md:grid md:grid-cols-[76px_1fr] lg:grid-cols-[245px_1fr] ${noRail ? '' : 'xl:grid-cols-[245px_1fr_340px]'}`}>
      <aside className={`sticky top-0 hidden h-screen flex-col bg-side px-3 py-6 md:flex ${wide ? 'border-r border-line' : ''}`}>
        <Link href="/" className="mb-6 px-3" aria-label="Connect home">
          <img src="/logo.svg" alt="Connect" className="hidden h-7 w-auto lg:block" />
          <div className="h-7 w-7 overflow-hidden lg:hidden"><img src="/logo.svg" alt="Connect" className="h-7 max-w-none" /></div>
        </Link>
        <nav className="flex flex-1 flex-col gap-0.5">
          {nav.map(([h, l, Icon]) => {
            const a = on(h)
            const inner = <><Icon size={26} strokeWidth={a ? 2.6 : 1.8} className="transition group-hover:scale-105" />{label(l, a)}</>
            return h ? <Link key={l} href={h} className={row}>{inner}</Link> : <button key={l} className={row} onClick={soon}>{inner}</button>
          })}
          <Link href={profile} className={row}>
            <span className={`rounded-full ${on(profile) ? 'ring-2 ring-white' : ''}`}><Avatar name={me.name} size={26} /></span>{label('Profile', on(profile))}</Link>
          <div className="flex-1" />
          <Link href="/settings" className={row}><Menu size={26} strokeWidth={on('/settings') ? 2.6 : 1.8} />{label('Menu', on('/settings'))}</Link>
        </nav>
      </aside>
      <main className={wide ? 'w-full min-w-0' : profilePage ? 'mx-auto w-full min-w-0 max-w-[975px] px-4 pb-24 pt-5 md:pb-10 md:pt-10' : 'mx-auto w-full max-w-[640px] px-4 pb-24 pt-5 md:pb-10 md:pt-8'}>
        {!wide && <img src="/logo.svg" alt="Connect" className="mb-4 h-6 w-auto md:hidden" />}
        {children}
      </main>
      {!noRail && <aside className="hidden p-4 pt-8 xl:block"><div className="sticky top-8"><Rail me={me} /></div></aside>}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {[['/', House, 'Home'], ['/explore', Search, 'Search'], ['/create', SquarePlus, 'Create'], ['/messages', MessageCircle, 'Messages']].map(([h, Icon, l]) => {
          const I = Icon as typeof House
          return <Link key={h as string} href={h as string} aria-label={l as string} className="p-4"><I size={26} strokeWidth={on(h as string) ? 2.6 : 1.8} /></Link>
        })}
        <Link href={profile} aria-label="Profile" className="p-4"><Avatar name={me.name} size={26} /></Link>
      </nav>
      {toast && <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-lg md:bottom-8">{toast}</div>}
    </div>
  )
}