'use client'
import { useRouter } from 'next/navigation'
import { Composer } from '@/components/Feed'

export default function CreatePage() {
  const router = useRouter()
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Create Post</h1>
      <Composer onDone={() => router.push('/')} />
    </>
  )
}