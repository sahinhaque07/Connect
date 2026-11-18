export const card = 'mb-4 rounded-2xl border border-line bg-panel p-4'
export const btn = 'rounded-full bg-brand px-5 py-2 font-semibold text-white transition hover:brightness-110 disabled:opacity-50'
export const ghost = 'rounded-full border border-line px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-white/10'
export const field = 'w-full rounded-xl border border-line bg-panel2 px-3 py-2.5 outline-none transition focus:border-white/40'

export function Avatar({ name, src, size = 44, ring }: { name: string; src?: string; size?: number; ring?: boolean }) {
  const face = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} style={{ width: size, height: size }} className="shrink-0 rounded-full bg-panel2 object-cover" />
  ) : (
    <div style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 font-bold text-white">
      {name[0]?.toUpperCase()}
    </div>
  )
  if (!ring) return face
  return (
    <div className="shrink-0 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
      <div className="rounded-full bg-bg p-[2px]">{face}</div>
    </div>
  )
}