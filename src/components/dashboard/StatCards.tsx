import { Clock, CheckCircle, TrendingUp, Star, BookOpen } from 'lucide-react'
import { ts } from '@/lib/i18n'

export default function StatCards({ 
  stats, 
  lang 
}: { 
  stats: { lbl: string; val: string | number; clr: string; icon: any }[];
  lang: string;
}) {
  const t = (s: string, k: string) => ts(lang as any, s, k)
  
  return (
    <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.65rem' }}>
      {stats.map((s, i) => (
        <div key={i} className="stat-card" style={{ borderLeft: `3px solid ${s.clr}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.6rem' }}>
            <p className="stat-lbl">{s.lbl}</p>
            <s.icon size={14} style={{ color: s.clr }} />
          </div>
          <p className="stat-val" style={{ color: s.clr }}>{s.val}</p>
        </div>
      ))}
    </div>
  )
}
