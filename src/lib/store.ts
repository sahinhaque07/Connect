'use client'
// Temporary data layer: everything is saved in the browser (localStorage).
// When the backend is ready, only this file changes (actions -> fetch calls).
import { useSyncExternalStore } from 'react'

export type User = { id: string; username: string; name: string; bio: string; follows: string[]; pw?: string }
export type Post = { id: string; by: string; cap: string; imgs: string[]; t: number; likes: string[]; loc?: string; shares?: number; comments?: { id: string; by: string; body: string; t: number }[] }
export type Story = { id: string; by: string; img: string; t: number; seen: string[] }
export type Msg = { id: string; from: string; to: string; body: string; t: number }
type DB = { users: User[]; posts: Post[]; stories: Story[]; msgs: Msg[]; me: string | null }

const KEY = 'connect_web_v1'
const seed: DB = {
  users: ['ananya_s:Ananya Sharma', 'rohanm:Rohan Mehta', 'diyaverma:Diya Verma', 'sahil_c:Sahil Chopra'].map((s, i) => {
    const [username, name] = s.split(':')
    return { id: 'bot' + i, username, name, bio: 'Sharing good vibes.', follows: [] }
  }),
  posts: [], stories: [], msgs: [], me: null,
}
let db: DB = seed, loaded = false
const subs = new Set<() => void>()
function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try { const d = localStorage.getItem(KEY); if (d) db = JSON.parse(d) } catch {}
}
function edit(f: (d: DB) => void) {
  const d = structuredClone(db); f(d); db = d
  try { localStorage.setItem(KEY, JSON.stringify(db)) } catch { alert('Browser storage is full. Delete some posts or stories.') }
  subs.forEach(s => s())
}
export const useDB = () =>
  useSyncExternalStore(cb => { subs.add(cb); return () => { subs.delete(cb) } }, () => { load(); return db }, () => seed)
export const useHydrated = () => useSyncExternalStore(() => () => {}, () => true, () => false)

const uid = () => Math.random().toString(36).slice(2, 10)
const hash = async (p: string) =>
  [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('connect:' + p)))].map(b => b.toString(16).padStart(2, '0')).join('')
const replies = ['Hey! Great to hear from you 😊', 'Love that. Tell me more!', 'Haha, same here ✨']

export const actions = {
  async signup(username: string, name: string, password: string) {
    const u = username.trim().toLowerCase()
    if (!/^[a-z0-9_.]{3,30}$/.test(u)) throw new Error('Username: 3–30 letters, numbers, _ or .')
    if (password.length < 8) throw new Error('Password needs at least 8 characters')
    if (db.users.some(x => x.username === u)) throw new Error('That username is taken')
    const id = uid(), pw = await hash(password)
    edit(d => { d.users.push({ id, username: u, name: name.trim() || u, bio: '', follows: [], pw }); d.me = id })
  },
  async login(username: string, password: string) {
    const u = db.users.find(x => x.username === username.trim().toLowerCase() && x.pw)
    if (!u || u.pw !== (await hash(password))) throw new Error('Wrong username or password')
    edit(d => { d.me = u.id })
  },
  logout: () => edit(d => { d.me = null }),
  post: (cap: string, imgs: string[], loc = '') => edit(d => { d.posts.unshift({ id: uid(), by: d.me!, cap, imgs, t: Date.now(), likes: [], loc: loc.trim(), shares: 0, comments: [] }) }),
  delPost: (id: string) => edit(d => { d.posts = d.posts.filter(p => !(p.id === id && p.by === d.me)) }),
  like: (id: string) => edit(d => {
    const p = d.posts.find(x => x.id === id)!, i = p.likes.indexOf(d.me!)
    i < 0 ? p.likes.push(d.me!) : p.likes.splice(i, 1)
  }),
  follow: (id: string) => edit(d => {
    const m = d.users.find(u => u.id === d.me)!, i = m.follows.indexOf(id)
    i < 0 ? m.follows.push(id) : m.follows.splice(i, 1)
  }),
  bio: (bio: string) => edit(d => { d.users.find(u => u.id === d.me)!.bio = bio.slice(0, 160) }),
  comment: (id: string, body: string) => edit(d => { const p = d.posts.find(x => x.id === id)!; (p.comments ??= []).push({ id: uid(), by: d.me!, body: body.slice(0, 500), t: Date.now() }) }),
  share: (id: string) => edit(d => { const p = d.posts.find(x => x.id === id)!; p.shares = (p.shares ?? 0) + 1 }),
  profile: (name: string, bio: string) => edit(d => { const u = d.users.find(x => x.id === d.me)!; u.name = name.slice(0, 60); u.bio = bio.slice(0, 160) }),
  deleteAccount: () => edit(d => {
    const id = d.me!
    d.users = d.users.filter(u => u.id !== id); d.posts = d.posts.filter(p => p.by !== id); d.stories = d.stories.filter(s => s.by !== id)
    d.msgs = d.msgs.filter(m => m.from !== id && m.to !== id); d.users.forEach(u => { u.follows = u.follows.filter(x => x !== id) }); d.me = null
  }),
  story: (img: string) => edit(d => { d.stories.push({ id: uid(), by: d.me!, img, t: Date.now(), seen: [] }) }),
  seen: (by: string) => edit(d => { d.stories.forEach(s => { if (s.by === by && !s.seen.includes(d.me!)) s.seen.push(d.me!) }) }),
  send(to: string, body: string) {
    edit(d => { d.msgs.push({ id: uid(), from: d.me!, to, body, t: Date.now() }) })
    if (db.users.find(u => u.id === to && !u.pw))
      setTimeout(() => edit(d => { d.msgs.push({ id: uid(), from: to, to: d.me!, body: replies[Math.floor(Math.random() * 3)], t: Date.now() }) }), 1200)
  },
}

export const activeStories = (d: DB) => d.stories.filter(s => Date.now() - s.t < 864e5)
export const ago = (t: number) => {
  const m = (Date.now() - t) / 6e4
  return m < 1 ? 'just now' : m < 60 ? `${Math.floor(m)}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`
}
const shrink = (file: File) => new Promise<string>(res => {
  const r = new FileReader()
  r.onload = () => {
    const i = new Image()
    i.onload = () => {
      const k = Math.min(1, 900 / Math.max(i.width, i.height)), c = document.createElement('canvas')
      c.width = i.width * k; c.height = i.height * k
      c.getContext('2d')!.drawImage(i, 0, 0, c.width, c.height)
      res(c.toDataURL('image/jpeg', 0.75))
    }
    i.src = r.result as string
  }
  r.readAsDataURL(file)
})
export const pick = (multi: boolean) => new Promise<string[]>(res => {
  const f = document.createElement('input')
  f.type = 'file'; f.accept = 'image/jpeg,image/png,image/webp'; f.multiple = multi
  f.onchange = async () => res(await Promise.all([...f.files!].filter(x => x.size < 8e6).slice(0, 4).map(shrink)))
  f.click()
})