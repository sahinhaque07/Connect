'use client'
import { useState } from 'react'
import { actions } from '@/lib/store'
import { btn, card, field } from './ui'

export default function AuthForm() {
  const [reg, setReg] = useState(false)
  const [f, setF] = useState({ name: '', username: '', password: '' })
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value })
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { reg ? await actions.signup(f.username, f.name, f.password) : await actions.login(f.username, f.password) }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className={`${card} w-96 max-w-full !p-7`}>
        <h1 className="text-3xl font-bold">Connect</h1>
        <p className="mb-5 text-sm text-mute">Share • Explore • Belong</p>
        <div className="mb-4 flex gap-2">
          {['Log in', 'Create account'].map((t, i) => (
            <button type="button" key={t} onClick={() => { setReg(!!i); setErr('') }}
              className={`flex-1 rounded-lg py-2 ${reg === !!i ? 'bg-brand' : 'bg-panel2 text-mute'}`}>{t}</button>
          ))}
        </div>
        <div className="space-y-2.5">
          {reg && <input className={field} placeholder="Display name" value={f.name} onChange={set('name')} />}
          <input className={field} placeholder="Username" autoCapitalize="none" value={f.username} onChange={set('username')} />
          <input className={field} type="password" placeholder="Password (min 8 characters)" value={f.password} onChange={set('password')} />
        </div>
        <p className="mt-2 min-h-6 text-sm text-rose-300">{err}</p>
        <button className={`${btn} w-full`} disabled={busy}>{reg ? 'Create account' : 'Log in'}</button>
      </form>
    </div>
  )
}