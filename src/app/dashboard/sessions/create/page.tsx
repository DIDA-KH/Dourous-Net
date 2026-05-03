'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, CheckCircle, FileText, Upload, BookOpen } from 'lucide-react'
import { useUi } from '@/context/UiContext'

export default function CreateCoursePage() {
  const router = useRouter()
  const { t, isRTL } = useUi()
  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'

  const [form, setForm] = useState({ title: '', subject: 'Mathématiques', description: '' })
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        subject: form.subject,
        description: form.description,
      }),
    })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      setError(String(json?.error ?? 'Failed to publish'))
      setLoading(false)
      return
    }

    const courseId = String(json?.course?.id ?? '')
    if (courseId && files.length > 0) {
      for (const f of files) {
        const fd = new FormData()
        fd.set('course_id', courseId)
        fd.set('file', f)
        const fileRes = await fetch('/api/courses/files', { method: 'POST', body: fd })
        if (!fileRes.ok) {
          const fj = await fileRes.json().catch(() => null)
          setError(String(fj?.error ?? `Failed to upload file: ${f.name}`))
          setLoading(false)
          return
        }
      }
    }

    setSuccess(true)
    setTimeout(() => router.push('/dashboard/sessions'), 300)
  }

  if (success) {
    return (
      <div className="card fade-up" style={{ textAlign: 'center', padding: '3rem 2rem', maxWidth: 400, margin: '2rem auto' }}>
        <div style={{ width: 56, height: 56, borderRadius: 'var(--r-full)', background: 'rgba(22,163,74,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <CheckCircle size={28} color="#16a34a"/>
        </div>
        <h2 style={{ margin: '0 0 .5rem', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text)', fontFamily: F }}>{t('courses','courseCreated')}</h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '.9rem', color: 'var(--text-3)', fontFamily: F }}>{t('courses','courseCreatedDesc')}</p>
        <div className="btn btn-primary btn-md" style={{ display: 'inline-flex', fontFamily: F }}>{t('courses','redirecting')}</div>
      </div>
    )
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/dashboard/sessions"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: 'var(--text-3)', marginBottom: '1rem', transition: 'color .15s', fontFamily: F }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <ArrowLeft size={13}/> {t('courses','backToMyCourses')}
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ fontFamily: F }}>{t('courses','createTitle')}</h1>
        </div>
      </div>

      <div className="fade-up d1 card" style={{ maxWidth: 800, margin: '0 auto' }}>
        {error && <div className="err-box" style={{ marginBottom: '1.25rem', fontFamily: F }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="field">
            <label className="label" style={{ fontFamily: F }}>{t('courses','titleLabel')} *</label>
            <div className="input-wrap">
              <BookOpen size={16} style={{ color: 'var(--text-4)' }}/>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder={t('courses','titlePlaceholder')} required className="input" style={{ fontFamily: F }}/>
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ fontFamily: F }}>{t('courses','subjectLabel')} *</label>
            <div className="input-wrap">
              <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input" style={{ fontFamily: F }}>
                <option>Mathématiques</option>
                <option>Physique</option>
                <option>Sciences</option>
                <option>Informatique</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label className="label" style={{ fontFamily: F }}>{t('courses','descLabel')}</label>
            <div className="input-wrap" style={{ alignItems: 'flex-start' }}>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={t('courses','descPlaceholder')} className="input" style={{ minHeight: 80, fontFamily: F }}/>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '.5rem' }}>
            <label className="label" style={{ fontFamily: F }}>{t('courses','filesLabel')}</label>
            <div style={{ border: '2px dashed var(--border-2)', borderRadius: 'var(--r-lg)', padding: '2rem', textAlign: 'center', background: 'var(--surface)' }}>
              <input type="file" multiple accept=".pdf" onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)) }} style={{ display: 'none' }} id="pdf-upload" />
              <label htmlFor="pdf-upload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
                <Upload size={24} color="var(--primary)" />
                <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.9rem', fontFamily: F }}>{t('courses','uploadCta')}</span>
                <span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontFamily: F }}>{t('courses','uploadHint')}</span>
              </label>
            </div>
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '1rem' }}>
                {files.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.5rem', padding: '.75rem 1rem', background: 'var(--primary-soft)', borderRadius: 'var(--r-md)', color: 'var(--primary)' }}>
                    <FileText size={16} />
                    <span style={{ fontWeight: 600, fontSize: '.85rem', fontFamily: F }}>{f.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" disabled={loading || !form.title} className="btn btn-primary btn-md" style={{ fontFamily: F }}>
              {loading ? <Loader2 size={16} className="spin"/> : t('courses','publish')}
            </button>
            <Link href="/dashboard/sessions" className="btn btn-outline btn-md" style={{ fontFamily: F }}>
              {t('courses','cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
