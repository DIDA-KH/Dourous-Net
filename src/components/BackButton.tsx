'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Retour', style = {} }: { label?: string; style?: React.CSSProperties }) {
  const router = useRouter()
  return (
    <button 
      onClick={() => router.back()}
      style={{ 
        background: 'none', border: 'none', padding: 0, cursor: 'pointer', 
        display: 'inline-flex', alignItems: 'center', gap: '.4rem', 
        fontSize: '.82rem', color: 'var(--text-3)', transition: 'color .15s',
        ...style 
      }}
      onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
      onMouseOut={e => (e.currentTarget.style.color = 'var(--text-3)')}
    >
      <ArrowLeft size={13}/> {label}
    </button>
  )
}
