'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronDown, Ellipsis, Search, Send, Smile, SquarePen, Trash2, X } from 'lucide-react'
import { actions, ago, useDB, type Msg, type User } from '@/lib/store'
import { Avatar } from '@/components/ui'

type Row = { u: User; m?: Msg }
type Menu = { kind: 'chat' | 'msg'; id: string; x: number; y: number } | null
const EMOJIS = ['😊', '😂', '😍', '🔥', '👍', '🙏', '🎉', '❤️']
// 3-dot button: hidden until you hover the row (always visible on touch screens)
const dotsCls = (lit: boolean) =>
  `rounded-full p-1.5 text-mute transition hover:bg-white/10 hover:text-white focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${lit ? 'opacity-100' : 'opacity-0'}`

export default function MessagesPage() {
  const db = useDB()
  const me = db.users.find(u => u.id === db.me)!
  const params = useSearchParams()
  const [peer, setPeer] = useState<string | null>(params.get('with'))
  const [tab, setTab] = useState<'primary' | 'general'>('primary')
  const [q, setQ] = useState('')
  const [text, setText] = useState('')
  const [emoji, setEmoji] = useState(false)
  const [compose, setCompose] = useState(false)
  const [cq, setCq] = useState('')
  const [menu, setMenu] = useState<Menu>(null)
  const [confirm, setConfirm] = useState<string | null>(null)
  const box = useRef<HTMLDivElement>(null)

  // ---- conversations (messages I deleted for myself are hidden) ----
  const mine = db.msgs.filter(m => (m.from === me.id || m.to === me.id) && !m.hid?.includes(me.id))
  const sent = new Set(mine.filter(m => m.from === me.id).map(m => m.to))
  const last = new Map<string, Msg>()
  for (const m of mine) {
    const other = m.from === me.id ? m.to : m.from
    const prev = last.get(other)
    if (!prev || m.t >= prev.t) last.set(other, m)
  }
  const rows: Row[] = []
  last.forEach((m, id) => { const u = db.users.find(x => x.id === id); if (u) rows.push({ u, m }) })
  const draft = peer && !last.has(peer) ? db.users.find(u => u.id === peer) : undefined
  if (draft) rows.push({ u: draft })
  rows.sort((a, b) => (b.m?.t ?? Date.now()) - (a.m?.t ?? Date.now()))
  const isGeneral = (r: Row) => !!r.m && !me.follows.includes(r.u.id) && !sent.has(r.u.id)
  const shown = rows.filter(r => (tab === 'general') === isGeneral(r))

  const needle = q.trim().toLowerCase()
  const found = needle
    ? db.users.filter(u => u.id !== me.id && (u.username.includes(needle) || u.name.toLowerCase().includes(needle)))
    : []

  // ---- open chat ----
  const p = db.users.find(u => u.id === peer)
  const chat = p ? mine.filter(m => m.from === p.id || m.to === p.id) : []
  useEffect(() => { const b = box.current; if (b) b.scrollTop = b.scrollHeight }, [chat.length, peer])
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(null); setConfirm(null); setCompose(false) } }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const open = (id: string) => { setPeer(id); setQ(''); setCompose(false); setCq(''); setText(''); setEmoji(false); setMenu(null) }
  const send = () => {
    const b = text.trim()
    if (!b || !p) return
    actions.send(p.id, b); setText(''); setEmoji(false)
  }

  // ---- 3-dot menu ----
  const openMenu = (e: React.MouseEvent<HTMLElement>, kind: 'chat' | 'msg', id: string) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect(), w = 176, h = 52
    setMenu({
      kind, id,
      x: Math.max(8, Math.min(r.right - w, window.innerWidth - w - 8)),
      y: r.bottom + h + 8 > window.innerHeight ? r.top - h - 4 : r.bottom + 4,
    })
  }
  const doDelete = () => {
    if (!menu) return
    if (menu.kind === 'msg') actions.delMsg(menu.id)
    else setConfirm(menu.id)
    setMenu(null)
  }
  const confirmUser = db.users.find(u => u.id === confirm)
  const deleteChat = () => {
    if (!confirm) return
    actions.delChat(confirm)
    if (peer === confirm) setPeer(null)
    setConfirm(null)
  }

  const candidates = db.users
    .filter(u => u.id !== me.id && (!cq.trim() || u.username.includes(cq.trim().toLowerCase()) || u.name.toLowerCase().includes(cq.trim().toLowerCase())))
    .sort((a, b) => Number(me.follows.includes(b.id)) - Number(me.follows.includes(a.id)))

  const tabCls = (on: boolean) => `flex-1 border-b py-3 text-center text-[15px] font-semibold transition ${on ? 'border-white text-white' : 'border-transparent text-mute hover:text-white'}`

  return (
    <div className="flex h-[calc(100dvh-60px)] min-w-0 bg-side md:h-screen">
      {/* ===== Left: conversation list ===== */}
      <section className={`${p ? 'hidden md:flex' : 'flex'} min-h-0 w-full flex-col border-r border-line md:w-[340px] md:shrink-0 lg:w-[430px]`}>
        <header className="flex items-center justify-between px-6 pb-3 pt-8">
          <h1 className="flex items-center gap-2 text-[22px] font-semibold"><span className="truncate">{me.username}</span><ChevronDown size={20} /></h1>
          <button aria-label="New message" onClick={() => setCompose(true)} className="rounded-lg p-1 transition hover:bg-white/10"><SquarePen size={26} strokeWidth={1.8} /></button>
        </header>
        <div className="flex">
          <button className={tabCls(tab === 'primary')} onClick={() => setTab('primary')}>Primary</button>
          <button className={tabCls(tab === 'general')} onClick={() => setTab('general')}>General</button>
        </div>
        <div className="px-7 pb-3 pt-4">
          <label className="flex h-12 items-center gap-3 rounded-full bg-panel2 px-4 text-mute focus-within:text-white">
            <Search size={18} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search" className="w-full bg-transparent text-[17px] text-white outline-none placeholder:text-white" />
            {q && <button aria-label="Clear search" onClick={() => setQ('')}><X size={16} /></button>}
          </label>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pb-4">
          {needle ? (
            <>
              {found.map(u => (
                <button key={u.id} onClick={() => open(u.id)} className="flex w-full items-center gap-3 px-6 py-2.5 text-left transition hover:bg-white/5">
                  <Avatar name={u.name} src={u.avatar} size={52} />
                  <div className="min-w-0 leading-tight"><b className="block truncate text-[15px]">{u.username}</b><span className="text-sm text-mute">{u.name}</span></div>
                </button>
              ))}
              {!found.length && <p className="px-6 py-6 text-sm text-mute">No account found.</p>}
            </>
          ) : (
            <>
              {shown.map(r => (
                <div key={r.u.id} className={`group relative transition ${peer === r.u.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                  <button onClick={() => open(r.u.id)} className="flex w-full items-center gap-3 px-6 py-2.5 pr-14 text-left">
                    <Avatar name={r.u.name} src={r.u.avatar} size={52} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <b className="block truncate text-[15px]">{r.u.username}</b>
                      <span className="block truncate text-sm text-mute">
                        {r.m ? `${r.m.from === me.id ? 'You: ' : ''}${r.m.body} · ${ago(r.m.t)}` : 'Start a conversation'}
                      </span>
                    </div>
                  </button>
                  {r.m && (
                    <button aria-label="Chat options" onClick={e => openMenu(e, 'chat', r.u.id)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${dotsCls(menu?.kind === 'chat' && menu.id === r.u.id)}`}>
                      <Ellipsis size={22} />
                    </button>
                  )}
                </div>
              ))}
              {!shown.length && (
                <p className="px-6 py-6 text-sm text-mute">
                  {tab === 'primary' ? 'No messages yet. Tap the pencil icon to start a chat.' : 'Messages from people you don’t follow show up here.'}
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ===== Right: chat or empty state ===== */}
      <section className={`${p ? 'flex' : 'hidden md:flex'} min-h-0 min-w-0 flex-1 flex-col`}>
        {p ? (
          <>
            <header className="flex items-center gap-3 border-b border-line px-4 py-3 md:px-6">
              <button aria-label="Back" onClick={() => setPeer(null)} className="rounded-lg p-1 hover:bg-white/10 md:hidden"><ArrowLeft size={24} /></button>
              <Link href={`/u/${p.username}`} className="flex min-w-0 items-center gap-3">
                <Avatar name={p.name} src={p.avatar} size={40} />
                <div className="min-w-0 leading-tight"><b className="block truncate text-[15px]">{p.name}</b><span className="text-xs text-mute">@{p.username}</span></div>
              </Link>
            </header>
            <div ref={box} className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-4 md:px-6">
              {chat.map((m, i) => {
                const mineMsg = m.from === me.id
                const gap = i === 0 || m.t - chat[i - 1].t > 36e5
                const dots = (
                  <button aria-label="Message options" onClick={e => openMenu(e, 'msg', m.id)} className={dotsCls(menu?.kind === 'msg' && menu.id === m.id)}>
                    <Ellipsis size={18} />
                  </button>
                )
                return (
                  <div key={m.id} className="flex flex-col">
                    {gap && <span className="my-2 self-center text-xs text-mute">{ago(m.t)}</span>}
                    <div className={`group flex items-center gap-1 ${mineMsg ? 'justify-end' : 'justify-start'}`}>
                      {mineMsg && dots}
                      <div className={`max-w-[75%] break-words rounded-3xl px-4 py-2.5 text-[15px] ${mineMsg ? 'bg-brand' : 'bg-panel2'}`}>{m.body}</div>
                      {!mineMsg && dots}
                    </div>
                  </div>
                )
              })}
              {!chat.length && (
                <div className="m-auto text-center">
                  <div className="mx-auto mb-3 w-fit"><Avatar name={p.name} src={p.avatar} size={84} /></div>
                  <b className="block text-lg">{p.name}</b>
                  <span className="text-sm text-mute">@{p.username} · Say hello 👋</span>
                </div>
              )}
            </div>
            <div className="relative px-4 pb-4 pt-2 md:px-6">
              {emoji && (
                <div className="absolute bottom-[68px] left-4 flex gap-1 rounded-2xl border border-line bg-panel2 p-2 shadow-lg md:left-6">
                  {EMOJIS.map(e => <button key={e} className="rounded-lg p-1 text-xl hover:bg-white/10" onClick={() => setText(t => t + e)}>{e}</button>)}
                </div>
              )}
              <div className="flex items-center gap-3 rounded-full border border-line px-4 py-2.5">
                <button aria-label="Emoji" onClick={() => setEmoji(v => !v)} className="text-mute transition hover:text-white"><Smile size={24} /></button>
                <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} maxLength={2000}
                  placeholder="Message…" className="w-full bg-transparent text-[15px] outline-none placeholder:text-mute" />
                {text.trim() && <button onClick={send} className="text-sm font-semibold text-brand transition hover:text-white">Send</button>}
              </div>
            </div>
          </>
        ) : (
          <div className="m-auto flex flex-col items-center px-6 text-center">
            <div className="grid h-[115px] w-[115px] place-items-center rounded-full border-2 border-white"><Send size={52} strokeWidth={1.3} className="-ml-1 mt-1" /></div>
            <h2 className="mt-5 text-[22px] font-semibold">Your messages</h2>
            <p className="mt-1 text-[15px]">Send a message to start a chat.</p>
            <button onClick={() => setCompose(true)} className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-[15px] font-medium text-white transition hover:brightness-110">Send Message</button>
          </div>
        )}
      </section>

      {/* ===== 3-dot menu popup ===== */}
      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
          <div role="menu" style={{ left: menu.x, top: menu.y }} className="fixed z-50 w-44 overflow-hidden rounded-xl border border-line bg-panel2 py-1 shadow-xl">
            <button role="menuitem" onClick={doDelete} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-[15px] font-semibold text-red-500 transition hover:bg-white/10">
              <Trash2 size={18} />Delete
            </button>
          </div>
        </>
      )}

      {/* ===== Delete chat confirmation ===== */}
      {confirm && confirmUser && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setConfirm(null)}>
          <div role="dialog" aria-label="Delete chat" className="w-full max-w-[360px] overflow-hidden rounded-2xl bg-panel2 text-center" onClick={e => e.stopPropagation()}>
            <div className="px-6 pb-5 pt-6">
              <b className="block text-lg">Delete chat?</b>
              <p className="mt-2 text-sm text-mute">This removes your chat with @{confirmUser.username} from your inbox. It only deletes it for you.</p>
            </div>
            <button onClick={deleteChat} className="w-full border-t border-line py-3 text-[15px] font-bold text-red-500 transition hover:bg-white/5">Delete</button>
            <button onClick={() => setConfirm(null)} className="w-full border-t border-line py-3 text-[15px] transition hover:bg-white/5">Cancel</button>
          </div>
        </div>
      )}

      {/* ===== New message popup ===== */}
      {compose && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={() => setCompose(false)}>
          <div role="dialog" aria-label="New message" className="flex max-h-[70vh] w-full max-w-[440px] flex-col overflow-hidden rounded-2xl bg-panel2" onClick={e => e.stopPropagation()}>
            <div className="relative border-b border-line py-3 text-center font-semibold">
              New message
              <button aria-label="Close" onClick={() => setCompose(false)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 hover:bg-white/10"><X size={22} /></button>
            </div>
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <b className="text-[15px]">To:</b>
              <input autoFocus value={cq} onChange={e => setCq(e.target.value)} placeholder="Search…" className="w-full bg-transparent outline-none placeholder:text-mute" />
            </div>
            <div className="min-h-[120px] overflow-y-auto py-2">
              {candidates.map(u => (
                <button key={u.id} onClick={() => open(u.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/5">
                  <Avatar name={u.name} src={u.avatar} size={44} />
                  <div className="min-w-0 leading-tight"><b className="block truncate text-[15px]">{u.username}</b><span className="text-sm text-mute">{u.name}</span></div>
                </button>
              ))}
              {!candidates.length && <p className="px-4 py-4 text-sm text-mute">No account found.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}