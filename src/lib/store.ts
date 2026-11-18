'use client'
// Temporary data layer: everything is saved in the browser (localStorage).
// When the backend is ready, only this file changes (actions -> fetch calls).
import { useSyncExternalStore } from 'react'

export type Highlight = { id: string; title: string; img: string }
export type User = { id: string; username: string; name: string; bio: string; follows: string[]; pw?: string; highlights?: Highlight[]; avatar?: string; welcomed?: boolean }
export type Post = { id: string; by: string; cap: string; imgs: string[]; t: number; likes: string[]; saved?: string[]; loc?: string; shares?: number; likeBase?: number; comments?: { id: string; by: string; body: string; t: number }[] }
export type Story = { id: string; by: string; img: string; t: number; seen: string[] }
export type Msg = { id: string; from: string; to: string; body: string; t: number; hid?: string[] }
export type Notif = { id: string; type: 'like' | 'comment' | 'follow'; by: string; to: string; post?: string; body?: string; t: number; read?: boolean }
type DB = { users: User[]; posts: Post[]; stories: Story[]; msgs: Msg[]; notifs: Notif[]; me: string | null }

const KEY = 'connect_web_v1'
// ---------- Demo data: people, photos, likes and comments ----------
// Photos come from picsum.photos (real photographs) and avatars from pravatar.cc, so they need an internet connection.
const H = 36e5
const BOTS: [string, string, string, number][] = [
  ['ananya_s', 'Ananya Sharma', 'Designer · chai over coffee ☕', 47],
  ['rohanm', 'Rohan Mehta', 'Weekend trekker 🏔️ · Pune', 12],
  ['diyaverma', 'Diya Verma', 'Art, books and slow mornings 📚', 5],
  ['sahil_c', 'Sahil Chopra', 'Photographer · Delhi 📸', 33],
  ['kabir.travels', 'Kabir Malhotra', '30 countries and counting ✈️', 15],
  ['meera.eats', 'Meera Iyer', 'Food blogger · recipes every Friday 🍜', 32],
  ['arjun_lens', 'Arjun Nair', 'Street + nature photography', 60],
  ['sana.art', 'Sana Khan', 'Illustrator · open for commissions 🎨', 25],
  ['vikram.fit', 'Vikram Rao', 'Coach · lift, run, repeat 💪', 52],
  ['tanya_codes', 'Tanya Bose', 'Software engineer · building in public 💻', 9],
]
// [author, photos, caption, location, hours ago, base likes, comments]
const SPEC: [number, number, string, string, number, number, number][] = [
  [4, 3, 'Golden hour never gets old 🌅 #travel #sunset', 'Santorini, Greece', 2, 18240, 4],
  [5, 1, 'Sunday brunch done right 🥞 #food', 'Mumbai', 3, 2310, 3],
  [6, 1, 'Quiet corners of the city. #city #photography', 'Old Delhi', 5, 9120, 2],
  [7, 2, 'New series, still wet on the page 🎨 #art', '', 7, 4810, 5],
  [1, 1, 'Above the clouds, below the stress. #nature #travel', 'Sahyadri Range', 9, 7420, 3],
  [8, 1, 'Leg day is a lifestyle 🏋️ #fitness', 'Hyderabad', 11, 1890, 2],
  [9, 1, 'Shipped v2 tonight. Coffee did most of the work ☕ #tech', 'Bengaluru', 13, 3320, 4],
  [0, 2, 'Weekend slow-down. #nature', 'Coorg', 16, 5630, 3],
  [3, 1, 'Light and shadow. #photography #city', 'Jaipur', 19, 12480, 4],
  [4, 1, 'Found the quietest beach on the island 🌊 #travel #nature', 'Palawan', 22, 21850, 5],
  [2, 1, 'Reading nook upgrade 📖 #art', '', 26, 2740, 2],
  [5, 2, 'Handmade pasta, no regrets 🍝 #food', 'Home kitchen', 29, 6540, 3],
  [6, 1, 'Mist, pines and silence. #nature', 'Munnar', 33, 15200, 3],
  [1, 3, 'Trail diaries, day three ⛰️ #travel #nature', 'Kedarkantha', 38, 8830, 4],
  [7, 1, 'Sketchbook page of the day ✏️ #art', '', 44, 3190, 2],
  [9, 1, 'Debugging at 2am hits different. #tech', '', 48, 1980, 3],
  [8, 1, 'Morning run, 10k done ✅ #fitness', 'Marine Drive', 52, 4120, 2],
  [0, 1, 'Soft light, warm tea. #food', 'Studio', 56, 2260, 2],
  [3, 2, 'Streets after the rain 🌧️ #city #photography', 'Kolkata', 60, 19340, 5],
  [4, 1, 'Postcard from the mountains 🏔️ #travel', 'Swiss Alps', 70, 26710, 4],
  [5, 1, 'Street food crawl, round two 🌶️ #food #city', 'Chandni Chowk', 76, 8410, 3],
  [2, 1, 'Watercolour weather ☔ #art', '', 84, 3640, 2],
  [6, 1, 'Waiting for the light. #photography #nature', 'Ladakh', 92, 22190, 4],
  [9, 1, 'Clean desk, clear mind. #tech', 'Home office', 100, 2870, 2],
  [1, 1, 'Sunrise camp, worth the 4am alarm. #nature', 'Lonavala', 110, 6110, 3],
  [8, 1, 'Form first, weight later. #fitness', 'Gym', 120, 2650, 2],
  [7, 2, 'Colour study for the new mural 🖌️ #art', 'Studio', 132, 5920, 3],
  [3, 1, 'Blue hour from the rooftop. #city', 'Mumbai', 144, 11030, 3],
  [0, 1, 'Little things. #nature', '', 160, 3480, 2],
  [4, 2, 'City lights and long walks. #travel #city', 'Tokyo', 176, 17760, 4],
  [5, 1, 'Sweet tooth sorted 🍰 #food', 'Bakery', 190, 4980, 3],
  [6, 1, 'Fields of green. #nature #travel', 'Kerala', 210, 9340, 2],
  [8, 1, 'Rest day. Stretch, eat, sleep. #fitness', '', 230, 1740, 1],
  [9, 1, 'Open-source weekend 💻 #tech', '', 250, 2410, 2],
]
const POOL = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
  41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 74, 75,
  76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98, 99]
const CMT = ['Absolutely stunning 😍', 'Love this!', 'Wow, where is this?', 'Goals 🔥', 'This made my day', 'Such a vibe ✨', 'Need to go here asap', 'Great shot!', 'Beautiful colours', 'Can’t stop looking at this']
let pi = 0
const photo = () => `https://picsum.photos/id/${POOL[pi++ % POOL.length]}/800/1000`

const seed: DB = {
  users: BOTS.map(([username, name, bio, img], i) => ({
    id: 'bot' + i, username, name, bio, avatar: `https://i.pravatar.cc/150?img=${img}`,
    follows: [1, 2, 3, 4].map(k => 'bot' + ((i + k) % BOTS.length)),
  })),
  posts: SPEC.map(([b, n, cap, loc, h, lb, nc], i) => ({
    id: 'seed_p' + i, by: 'bot' + b, cap, loc, imgs: Array.from({ length: n }, photo), t: Date.now() - h * H,
    likes: [], likeBase: lb, shares: 0,
    comments: Array.from({ length: nc }, (_, k) => ({ id: `seed_c${i}_${k}`, by: 'bot' + ((b + k + 1) % BOTS.length), body: CMT[(i + k) % CMT.length], t: Date.now() - h * H + (k + 1) * 6e5 })),
  })),
  stories: [], msgs: [], notifs: [], me: null,
}
let db: DB = seed, loaded = false
const subs = new Set<() => void>()
function load() {
  if (loaded || typeof window === 'undefined') return
  loaded = true
  try { const d = localStorage.getItem(KEY); if (d) db = JSON.parse(d) } catch {}
  merge()
}
// Older saved data gets the new demo people/posts added (once) without touching anything the user made.
function merge() {
  db.notifs ??= []
  for (const s of seed.users) {
    const u = db.users.find(x => x.id === s.id)
    if (!u) db.users.push(structuredClone(s))
    else { u.avatar ??= s.avatar; if (u.bio === 'Sharing good vibes.') u.bio = s.bio; if (!u.follows.length) u.follows = [...s.follows] }
  }
  for (const p of seed.posts) if (!db.posts.some(x => x.id === p.id)) db.posts.push(structuredClone(p))
  db.posts.sort((a, b) => b.t - a.t)
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

export const likeCount = (p: Post) => p.likes.length + (p.likeBase ?? 0)

// Demo bots react to what you do, so notifications feel alive.
const botComments = ['Love this! 😍', 'So good 🔥', 'Great shot!', 'This is amazing ✨', 'Wow, want to try this too']
function engage(postId: string, me: string) {
  const bots = db.users.filter(u => !u.pw).sort(() => Math.random() - 0.5).slice(0, 4)
  bots.forEach((b, k) => setTimeout(() => edit(d => {
    const p = d.posts.find(x => x.id === postId)
    if (!p || !d.users.some(u => u.id === me)) return
    if (!p.likes.includes(b.id)) p.likes.push(b.id)
    d.notifs.push({ id: uid(), type: 'like', by: b.id, to: me, post: postId, t: Date.now() })
    if (k === 1) {
      const body = botComments[Math.floor(Math.random() * botComments.length)]
      ;(p.comments ??= []).push({ id: uid(), by: b.id, body, t: Date.now() })
      d.notifs.push({ id: uid(), type: 'comment', by: b.id, to: me, post: postId, body, t: Date.now() })
    }
  }), 2500 + k * 4000))
}

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
  post(cap: string, imgs: string[], loc = '') {
    const id = uid(), me = db.me!
    edit(d => { d.posts.unshift({ id, by: me, cap, imgs, t: Date.now(), likes: [], loc: loc.trim(), shares: 0, comments: [] }) })
    engage(id, me)
  },
  delPost: (id: string) => edit(d => { d.posts = d.posts.filter(p => !(p.id === id && p.by === d.me)) }),
  like: (id: string) => edit(d => {
    const p = d.posts.find(x => x.id === id)!, i = p.likes.indexOf(d.me!)
    i < 0 ? p.likes.push(d.me!) : p.likes.splice(i, 1)
  }),
  follow(id: string) {
    const me = db.me!, adding = !db.users.find(u => u.id === me)!.follows.includes(id)
    edit(d => {
      const m = d.users.find(u => u.id === d.me)!, i = m.follows.indexOf(id)
      i < 0 ? m.follows.push(id) : m.follows.splice(i, 1)
    })
    // demo accounts follow you back after a few seconds
    if (adding && db.users.some(u => u.id === id && !u.pw && !u.follows.includes(me)))
      setTimeout(() => edit(d => {
        const b = d.users.find(u => u.id === id)
        if (!b || !d.users.some(u => u.id === me) || b.follows.includes(me)) return
        b.follows.push(me); d.notifs.push({ id: uid(), type: 'follow', by: id, to: me, t: Date.now() })
      }), 3000)
  },
  // First visit: a few demo people follow you and like your posts, so Notifications isn't empty.
  welcome: () => edit(d => {
    const me = d.users.find(u => u.id === d.me)
    if (!me || me.welcomed) return
    me.welcomed = true
    const bots = d.users.filter(u => !u.pw)
    const order = [...bots.slice(4), ...bots.slice(0, 4)]
    ;[4, 35, 190, 1500, 2900].forEach((m, k) => {
      const b = order[k]
      if (!b || b.follows.includes(me.id)) return
      b.follows.push(me.id); d.notifs.push({ id: uid(), type: 'follow', by: b.id, to: me.id, t: Date.now() - m * 6e4 })
    })
    d.posts.filter(p => p.by === me.id).slice(0, 3).forEach((p, i) => {
      order.slice(i, i + 3).forEach((b, k) => {
        if (!p.likes.includes(b.id)) p.likes.push(b.id)
        d.notifs.push({ id: uid(), type: 'like', by: b.id, to: me.id, post: p.id, t: Date.now() - (60 + i * 400 + k * 90) * 6e4 })
      })
    })
  }),
  readNotifs: () => edit(d => { d.notifs.forEach(n => { if (n.to === d.me) n.read = true }) }),
  bio: (bio: string) => edit(d => { d.users.find(u => u.id === d.me)!.bio = bio.slice(0, 160) }),
  comment: (id: string, body: string) => edit(d => { const p = d.posts.find(x => x.id === id)!; (p.comments ??= []).push({ id: uid(), by: d.me!, body: body.slice(0, 500), t: Date.now() }) }),
  share: (id: string) => edit(d => { const p = d.posts.find(x => x.id === id)!; p.shares = (p.shares ?? 0) + 1 }),
  profile: (name: string, bio: string) => edit(d => { const u = d.users.find(x => x.id === d.me)!; u.name = name.slice(0, 60); u.bio = bio.slice(0, 160) }),
  // Profile picture: pass a data URL to set it, or '' to remove it
  avatar: (img: string) => edit(d => { const u = d.users.find(x => x.id === d.me)!; if (img) u.avatar = img; else delete u.avatar }),
  // Profile highlights (the round "New" circles on a profile)
  highlight: (title: string, img: string) => edit(d => { const u = d.users.find(x => x.id === d.me)!; (u.highlights ??= []).push({ id: uid(), title: title.trim().slice(0, 15) || 'Highlights', img }) }),
  delHighlight: (id: string) => edit(d => { const u = d.users.find(x => x.id === d.me)!; u.highlights = (u.highlights ?? []).filter(h => h.id !== id) }),
  deleteAccount: () => edit(d => {
    const id = d.me!
    d.users = d.users.filter(u => u.id !== id); d.posts = d.posts.filter(p => p.by !== id); d.stories = d.stories.filter(s => s.by !== id)
    d.msgs = d.msgs.filter(m => m.from !== id && m.to !== id); d.notifs = d.notifs.filter(n => n.to !== id && n.by !== id); d.users.forEach(u => { u.follows = u.follows.filter(x => x !== id) }); d.me = null
  }),
  save: (id: string) => edit(d => { const p = d.posts.find(x => x.id === id)!, s = (p.saved ??= []), i = s.indexOf(d.me!); i < 0 ? s.push(d.me!) : s.splice(i, 1) }),
  story: (img: string) => edit(d => { d.stories.push({ id: uid(), by: d.me!, img, t: Date.now(), seen: [] }) }),
  seen: (by: string) => edit(d => { d.stories.forEach(s => { if (s.by === by && !s.seen.includes(d.me!)) s.seen.push(d.me!) }) }),
  // Delete one message: my own message is removed for everyone, a received one is hidden only for me.
  delMsg: (id: string) => edit(d => {
    const m = d.msgs.find(x => x.id === id)
    if (!m) return
    if (m.from === d.me) d.msgs = d.msgs.filter(x => x.id !== id)
    else if (m.to === d.me) { const h = (m.hid ??= []); if (!h.includes(d.me!)) h.push(d.me!) }
  }),
  // Delete a whole chat: hides every message of that chat for me only.
  delChat: (peer: string) => edit(d => {
    d.msgs.forEach(m => {
      if ((m.from === d.me && m.to === peer) || (m.from === peer && m.to === d.me)) {
        const h = (m.hid ??= []); if (!h.includes(d.me!)) h.push(d.me!)
      }
    })
  }),
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

// Profile picture picker: centre-crops to a square and shrinks to 320px so it stays tiny in localStorage.
export const pickAvatar = () => new Promise<string | null>(res => {
  const f = document.createElement('input')
  f.type = 'file'; f.accept = 'image/jpeg,image/png,image/webp'
  f.oncancel = () => res(null)
  f.onchange = () => {
    const file = f.files?.[0]
    if (!file || file.size > 8e6) return res(null)
    const r = new FileReader()
    r.onload = () => {
      const i = new Image()
      i.onload = () => {
        const side = Math.min(i.width, i.height), out = Math.min(320, side)
        const c = document.createElement('canvas')
        c.width = c.height = out
        c.getContext('2d')!.drawImage(i, (i.width - side) / 2, (i.height - side) / 2, side, side, 0, 0, out, out)
        res(c.toDataURL('image/jpeg', 0.85))
      }
      i.onerror = () => res(null)
      i.src = r.result as string
    }
    r.readAsDataURL(file)
  }
  f.click()
})