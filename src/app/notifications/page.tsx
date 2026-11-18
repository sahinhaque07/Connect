'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Heart, X } from 'lucide-react'
import { PostCard } from '@/components/Feed'
import { Avatar } from '@/components/ui'
import { actions, useDB, type Notif } from '@/lib/store'

const short = (t: number) => {
  const m = (Date.now() - t) / 6e4
  return m < 1 ? 'now' : m < 60 ? `${Math.floor(m)}m` : m < 1440 ? `${Math.floor(m / 60)}h` : m < 10080 ? `${Math.floor(m / 1440)}d` : `${Math.floor(m / 10080)}w`
}
const days = (t: number) => (Date.now() - t) / 864e5

export default function NotificationsPage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [openId, setOpenId] = useState<string | null>(null)
  const alive = useRef(false)

  // Mark everything as read when you leave the page (so the "New" section stays visible while you're here).
  useEffect(() => {
    alive.current = true
    return () => { alive.current = false; setTimeout(() => { if (!alive.current) actions.readNotifs() }, 50) }
  }, [])
  useEffect(() => {
    if (!openId) return
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [openId])

  const mine = db.notifs.filter(n => n.to === me.id && db.users.some(u => u.id === n.by)).sort((a, b) => b.t - a.t)
  const old = mine.filter(n => n.read)
  const sections: [string, Notif[]][] = [
    ['New', mine.filter(n => !n.read)],
    ['Today', old.filter(n => days(n.t) < 1)],
    ['This week', old.filter(n => days(n.t) >= 1 && days(n.t) < 7)],
    ['This month', old.filter(n => days(n.t) >= 7 && days(n.t) < 30)],
    ['Earlier', old.filter(n => days(n.t) >= 30)],
  ]
  const opened = db.posts.find(p => p.id === openId) ?? null

  const Row = ({ n }: { n: Notif }) => {
    const u = db.users.find(x => x.id === n.by)!, post = n.post ? db.posts.find(p => p.id === n.post) : undefined
    const f = me.follows.includes(u.id)
    return (
      <div className="flex items-center gap-3 py-2.5">
        <Link href={`/u/${u.username}`}><Avatar name={u.name} src={u.avatar} size={46} /></Link>
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <Link href={`/u/${u.username}`} className="font-semibold hover:text-mute">{u.username}</Link>{' '}
          {n.type === 'like' && 'liked your post.'}
          {n.type === 'comment' && <>commented: <span className="text-white/90">{n.body}</span></>}
          {n.type === 'follow' && 'started following you.'}{' '}
          <span className="text-mute">{short(n.t)}</span>
        </p>
        {n.type === 'follow'
          ? <button className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-semibold transition ${f ? 'bg-white/10 hover:bg-white/20' : 'bg-brand text-white hover:brightness-110'}`}
              onClick={() => actions.follow(u.id)}>{f ? 'Following' : 'Follow back'}</button>
          : post?.imgs[0] && (
            <button aria-label="Open post" className="shrink-0" onClick={() => setOpenId(post.id)}>
              <img src={post.imgs[0]} alt="" className="h-11 w-11 rounded-md object-cover" />
            </button>
          )}
      </div>
    )
  }

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Notifications</h1>
      {mine.length === 0 && (
        <div className="mx-auto flex max-w-[360px] flex-col items-center px-4 py-20 text-center">
          <div className="grid h-[78px] w-[78px] place-items-center rounded-full border border-white"><Heart size={36} strokeWidth={1.3} /></div>
          <h2 className="mt-6 text-xl font-bold">Activity on your posts</h2>
          <p className="mt-3 text-sm text-mute">When someone likes or comments on one of your posts, or follows you, you’ll see it here.</p>
        </div>
      )}
      {sections.filter(([, l]) => l.length).map(([title, l]) => (
        <section key={title} className="mb-4">
          <h2 className="mb-1 mt-4 flex items-center gap-2 text-base font-bold">{title}{title === 'New' && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs">{l.length}</span>}</h2>
          {l.map(n => <Row key={n.id} n={n} />)}
        </section>
      ))}

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