'use client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { PostCard } from '@/components/Feed'
import { Avatar, btn, card, ghost } from '@/components/ui'
import { actions, useDB } from '@/lib/store'

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>()
  const db = useDB(), me = db.users.find(x => x.id === db.me)!
  const u = db.users.find(x => x.username === username)
  if (!u) return <div className={card}>That user doesn’t exist.</div>
  const own = u.id === me.id, f = me.follows.includes(u.id)
  const posts = db.posts.filter(p => p.by === u.id)
  return (
    <>
      <div className={card}>
        <div className="flex items-center gap-5">
          <Avatar name={u.name} size={88} />
          <div>
            <h1 className="text-xl font-bold">{u.name}</h1><div className="text-sm text-mute">@{u.username}</div>
            <p className="mt-1">{u.bio || 'No bio yet.'}</p>
            <div className="mt-1 text-sm text-mute">{posts.length} posts · {db.users.filter(x => x.follows.includes(u.id)).length} followers · {u.follows.length} following</div>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {own ? <button className={ghost} onClick={() => { const b = prompt('Your bio', u.bio); if (b !== null) actions.bio(b) }}>Edit bio</button> : <>
            <button className={`${ghost} ${f ? '!bg-brand !text-white' : ''}`} onClick={() => actions.follow(u.id)}>{f ? 'Following' : 'Follow'}</button>
            <Link href={`/messages?with=${u.id}`} className={`${btn} !py-1.5 text-sm`}>Message</Link></>}
        </div>
      </div>
      {posts.length ? posts.map(p => <PostCard key={p.id} p={p} />) : <div className={`${card} text-mute`}>No posts yet.</div>}
    </>
  )
}