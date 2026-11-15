'use client'
import { useState } from 'react'
import Link from 'next/link'
import { actions, useDB } from '@/lib/store'
import { Avatar, card, field, ghost } from '@/components/ui'

export default function ExplorePage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [q, setQ] = useState('')
  const term = q.trim().toLowerCase().replace('@', '')
  const res = db.users.filter(u => u.id !== me.id && (!term || u.username.includes(term)))
  return (
    <div className={card}>
      <input autoFocus className={field} placeholder="Search people by username…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="mt-4 space-y-3">
        {res.map(u => {
          const f = me.follows.includes(u.id)
          return (
            <div key={u.id} className="flex items-center gap-3">
              <Link href={`/u/${u.username}`} className="flex flex-1 items-center gap-3">
                <Avatar name={u.name} size={40} /><div><b>{u.name}</b><div className="text-xs text-mute">@{u.username}</div></div></Link>
              <button className={`${ghost} ${f ? '!bg-brand !text-white' : ''}`} onClick={() => actions.follow(u.id)}>{f ? 'Following' : 'Follow'}</button>
            </div>
          )
        })}
        {!res.length && <p className="text-mute">No one matches that username.</p>}
      </div>
    </div>
  )
}