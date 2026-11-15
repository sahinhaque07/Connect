'use client'
import { Composer, PostCard, Stories } from '@/components/Feed'
import { card } from '@/components/ui'
import { useDB } from '@/lib/store'

export default function HomePage() {
  const db = useDB(), me = db.users.find(u => u.id === db.me)!
  const posts = db.posts.filter(p => p.by === me.id || me.follows.includes(p.by))
  return (
    <>
      <Stories />
      <Composer />
      {posts.length ? posts.map(p => <PostCard key={p.id} p={p} />)
        : <div className={`${card} text-mute`}>Your feed is empty. Post a photo, or find people in Explore.</div>}
    </>
  )
}