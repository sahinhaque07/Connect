'use client'
import Link from 'next/link'
import { PostCard, Stories } from '@/components/Feed'
import { useDB } from '@/lib/store'

export default function HomePage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const posts = db.posts.filter(p => p.by === me.id || me.follows.includes(p.by))
  return (
    <>
      <Stories />
      <div className="mx-auto mt-6 max-w-[470px]">
        {posts.map(p => <PostCard key={p.id} p={p} />)}
        {!posts.length && (
          <div className="rounded-2xl border border-line bg-panel p-8 text-center">
            <h2 className="text-lg font-semibold">Welcome to Connect</h2>
            <p className="mt-1 text-sm text-mute">Your feed is empty. Share your first photo, or follow people to see their posts.</p>
            <div className="mt-5 flex justify-center gap-3">
              <Link href="/create" className="rounded-lg bg-brand px-5 py-2 text-sm font-semibold">Create post</Link>
              <Link href="/explore" className="rounded-lg bg-white/10 px-5 py-2 text-sm font-semibold">Find people</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}