export const card = 'mb-4 rounded-2xl border border-line bg-panel p-4'
export const btn = 'rounded-full bg-brand px-5 py-2 font-semibold text-white hover:bg-violet-700 disabled:opacity-50'
export const ghost = 'rounded-full border border-brand px-4 py-1.5 text-sm font-semibold text-violet-300'
export const field = 'w-full rounded-xl border border-line bg-panel2 px-3 py-2.5 outline-none focus:border-brand'

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-violet-800 font-bold text-white">
      {name[0]?.toUpperCase()}
    </div>
  )
}