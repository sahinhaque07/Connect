'use client'
import { useState } from 'react'
import { actions, useDB } from '@/lib/store'
import { btn, card, field, ghost } from '@/components/ui'

export default function SettingsPage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const [name, setName] = useState(me.name), [bio, setBio] = useState(me.bio), [saved, setSaved] = useState(false)
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <div className={card}>
        <h2 className="mb-3 font-semibold">Profile</h2>
        <label className="text-sm text-mute">Display name</label>
        <input className={`${field} mb-3 mt-1`} value={name} maxLength={60} onChange={e => setName(e.target.value)} />
        <label className="text-sm text-mute">Bio</label>
        <textarea className={`${field} mt-1 resize-none`} rows={3} maxLength={160} value={bio} onChange={e => setBio(e.target.value)} />
        <div className="mt-3 flex items-center gap-3">
          <button className={btn} onClick={() => { actions.profile(name.trim() || me.username, bio); setSaved(true) }}>Save changes</button>
          {saved && <span className="text-sm text-mute">Saved ✓</span>}
        </div>
      </div>
      <div className={card}>
        <h2 className="mb-1 font-semibold">Account</h2>
        <p className="mb-3 text-sm text-mute">Signed in as @{me.username}</p>
        <div className="flex gap-3">
          <button className={ghost} onClick={() => actions.logout()}>Log out</button>
          <button className="rounded-full border border-rose-500 px-4 py-1.5 text-sm font-semibold text-rose-300"
            onClick={() => confirm('Delete your account and all your data? This cannot be undone.') && actions.deleteAccount()}>Delete account</button>
        </div>
      </div>
    </>
  )
}