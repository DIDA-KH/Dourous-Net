import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.65rem' }}>
      <div className="fade-up" style={{ paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ height: '14px', width: '80px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)', marginBottom: '.6rem' }} />
        <div style={{ height: '32px', width: '250px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: '.6rem' }} />
        <div style={{ height: '16px', width: '150px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }} />
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card" style={{ borderLeft: '3px solid var(--surface-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.6rem' }}>
              <div style={{ height: '12px', width: '60px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }} />
              <div style={{ height: '14px', width: '14px', background: 'var(--surface-2)', borderRadius: 'var(--r-full)' }} />
            </div>
            <div style={{ height: '28px', width: '80px', background: 'var(--surface-2)', borderRadius: 'var(--r-sm)' }} />
          </div>
        ))}
      </div>

      <div className="fade-up d2" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '1.25rem' }}>
        <div className="card" style={{ padding: '1.5rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={24} className="spin" style={{ color: 'var(--text-4)' }} />
        </div>
        <div className="card" style={{ padding: '1.5rem', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={24} className="spin" style={{ color: 'var(--text-4)' }} />
        </div>
      </div>
    </div>
  )
}
