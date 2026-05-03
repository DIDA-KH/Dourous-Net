import React from 'react'

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div 
      className={`pulse-glow ${className}`} 
      style={{ 
        background: 'var(--border-2)', 
        borderRadius: 'var(--r-md)', 
        ...style 
      }} 
    />
  )
}

export function StatCardsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.65rem' }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="stat-card">
          <Skeleton style={{ width: '60%', height: '14px', marginBottom: '12px' }} />
          <Skeleton style={{ width: '40%', height: '24px' }} />
        </div>
      ))}
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <Skeleton style={{ width: '150px', height: '20px', marginBottom: '1.5rem' }} />
      {[...Array(count)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
          <Skeleton style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <Skeleton style={{ width: '100px', height: '14px', marginBottom: '8px' }} />
            <Skeleton style={{ width: '180px', height: '12px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
