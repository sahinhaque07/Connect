'use client'
import { useEffect, useRef, useState } from 'react'
import { actions, useDB } from '@/lib/store'
import { Avatar, card, field } from '@/components/ui'

export default function MessagesPage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [peer, setPeer] = useState<string | null>(() => new URLSearchParams(location.search).get('with'))
  const [text, setText] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const mine = db.msgs.filter(m => m.from === me.id || m.to === me.id)
  const ids = [...new Set([...(peer ? [peer] : []), ...mine.map(m => (m.from === me.id ? m.to : m.from)), ...me.follows])]
  const p = db.users.find(u => u.id === peer)
  const chat = mine.filter(m => m.from === peer || m.to === peer)
  useEffect(() => { end.current?.scrollIntoView() }, [chat.length])
  const send = () => { const b = text.trim(); if (!b || !peer) return; actions.send(peer, b); setText('') }
  return (
    <div className="grid h-[calc(100vh-150px)] gap-4 md:grid-cols-[210px_1fr]">
      <div className={`${card} !mb-0 overflow-auto`}>
        {ids.map(id => {
          const u = db.users.find(x => x.id === id)!
          return (
            <button key={id} onClick={() => setPeer(id)} className={`flex w-full items-center gap-2 rounded-lg p-2 text-left ${peer === id ? 'bg-panel2' : ''}`}>
              <Avatar name={u.name} size={34} /><b className="truncate">@{u.username}</b></button>
          )
        })}
        {!ids.length && <p className="text-sm text-mute">Follow someone to start a chat.</p>}
      </div>
      <div className={`${card} !mb-0 flex flex-col`}>
        {p ? <>
          <b>{p.name} <span className="font-normal text-mute">@{p.username}</span></b>
          <div className="flex flex-1 flex-col gap-1.5 overflow-auto py-3">
            {chat.map(m => <div key={m.id} className={`max-w-[75%] rounded-2xl px-3 py-2 ${m.from === me.id ? 'self-end bg-brand' : 'bg-panel2'}`}>{m.body}</div>)}
            {!chat.length && <p className="text-mute">Say hello 👋</p>}<div ref={end} />
          </div>
          <input className={field} placeholder={`Message @${p.username}…`} value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} />
        </> : <p className="text-mute">Pick a conversation.</p>}
      </div>
    </div>
  )
}