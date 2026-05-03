'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUi } from '@/context/UiContext'
import { ArrowLeft, FileText, Calendar, Eye, Download, Users, User, Star, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function SessionDetailClient({ session: s, isTeacher, userId }: { session: any; isTeacher: boolean; userId: string }) {
  const { t, isRTL, lang } = useUi()
  const router = useRouter()
  const F = isRTL ? 'Cairo, var(--font)' : 'var(--font)'
  const locale = lang === 'ar' ? 'ar-DZ' : lang === 'en' ? 'en-US' : 'fr-DZ'
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [saved, setSaved] = useState(false)
  const [doc, setDoc] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadOk, setUploadOk] = useState(false)
  const [uploadErr, setUploadErr] = useState('')
  const [deletingFileId, setDeletingFileId] = useState('')
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null)

  const course = {
    title: s?.title || 'Course',
    subject: s?.subject || 'Mathématiques',
    description: s?.description || '—',
    created_at: s?.created_at || new Date().toISOString(),
    pdfs: Array.isArray(s?.pdfs) ? s.pdfs : [],
    students: Array.isArray(s?.students) ? s.students : [],
  }

  const d = new Date(course.created_at)
  const teacherName = s?.teacher?.full_name || 'teacher'

  useEffect(() => {
    // Track "learned" courses for student view
    if (isTeacher) return
    const courseId = s?.id
    if (!courseId) return
    try {
      const raw = document.cookie
        .split('; ')
        .find(x => x.startsWith('dn_learned_courses='))
        ?.split('=')[1]
      const decoded = raw ? decodeURIComponent(raw) : ''
      const set = new Set(decoded.split(',').map(v => v.trim()).filter(Boolean))
      
      // If we haven't seen this course yet, record a view in DB
      if (!set.has(String(courseId))) {
        fetch('/api/interactions/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId })
        }).catch(() => {})
      }

      set.add(String(courseId))
      const next = encodeURIComponent(Array.from(set).join(','))
      document.cookie = `dn_learned_courses=${next};path=/;max-age=31536000;samesite=lax`
    } catch {}
  }, [isTeacher, s?.id])

  useEffect(() => {
    if (isTeacher) return
    try {
      const raw = localStorage.getItem('dn_teacher_ratings')
      if (!raw) return
      const parsed = JSON.parse(raw) as Record<string, number>
      const savedRating = Number(parsed[teacherName] || 0)
      if (savedRating >= 1 && savedRating <= 5) {
        setRating(savedRating)
      }
    } catch {}
  }, [isTeacher, teacherName])

  const saveRating = async () => {
    if (isTeacher || rating < 1) return
    try {
      const raw = localStorage.getItem('dn_teacher_ratings')
      const parsed = raw ? (JSON.parse(raw) as Record<string, number>) : {}
      parsed[teacherName] = rating
      localStorage.setItem('dn_teacher_ratings', JSON.stringify(parsed))
      
      const res = await fetch('/api/teachers/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: s?.teacher?.id, rating })
      })

      if (res.ok) {
        setSaved(true)
        window.setTimeout(() => setSaved(false), 1800)
      } else {
        alert("Erreur lors de la sauvegarde de l'évaluation.")
      }
    } catch {
      alert("Erreur réseau.")
    }
  }

  const uploadInteractionDoc = async () => {
    if (isTeacher) return
    if (!doc) return
    setUploading(true)
    setUploadOk(false)
    setUploadErr('')

    const fd = new FormData()
    fd.set('course_id', String(s?.id ?? ''))
    fd.set('file', doc)

    const res = await fetch('/api/interactions/upload', { method: 'POST', body: fd })
    const json = await res.json().catch(() => null)
    if (!res.ok) {
      setUploadErr(String(json?.error ?? 'Upload failed'))
      setUploading(false)
      return
    }
    setUploadOk(true)
    setUploading(false)
    window.setTimeout(() => setUploadOk(false), 2500)
  }

  const deleteCourseFile = async (pdf: any) => {
    if (!isTeacher) return
    if (!pdf?.path) return
    const ok = window.confirm(`Delete file "${pdf.name}" ?`)
    if (!ok) return
    setDeletingFileId(String(pdf.id))
    const res = await fetch('/api/courses/files', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: s?.id, filePath: pdf.path }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      alert(String(json?.error ?? 'Failed to delete file'))
      setDeletingFileId('')
      return
    }
    window.location.reload()
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="fade-up" style={{ marginBottom: '1.65rem', paddingBottom: '1.2rem', borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.82rem', color: 'var(--text-3)', marginBottom: '1rem', transition: 'color .15s', fontFamily: F }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <ArrowLeft size={13}/> Retour
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <h1 className="page-title" style={{ fontFamily: F }}>{course.title}</h1>
          <span className="badge badge-completed">{course.subject}</span>
        </div>
      </div>

      <div className="fade-up d1" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)', gap: '1.5rem' }}>

        {/* Left: details + pdfs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Course info */}
          <div className="card">
            <p style={{ margin: '0 0 1.1rem', fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: F }}>{t('sessions','courseDetails')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.85rem' }}>
              <div style={{ padding: '.75rem .9rem', borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.25rem' }}>
                  <Calendar size={13} style={{ color: 'var(--primary)' }}/>
                  <span style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: F }}>{t('sessions','createdOn')}</span>
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.88rem', color: 'var(--text)', fontFamily: F }}>
                  {d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div style={{ padding: '.75rem .9rem', borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem', marginBottom: '.25rem' }}>
                  <Eye size={13} style={{ color: 'var(--primary)' }}/>
                  <span style={{ fontSize: '.7rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: F }}>{t('sessions','totalViews')}</span>
                </div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '.88rem', color: 'var(--text)', fontFamily: F }}>
                  {course.students.length} {t('sessions','students')}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '.85rem', padding: '.85rem', borderRadius: 'var(--r-lg)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p style={{ margin: '0 0 .3rem', fontSize: '.72rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', fontFamily: F }}>{t('sessions','description')}</p>
              <p style={{ margin: 0, fontSize: '.875rem', color: 'var(--text)', lineHeight: 1.65, fontFamily: F }}>{course.description}</p>
            </div>
          </div>

          {/* PDFs List */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '1rem' }}>
              <FileText size={18} color="var(--primary)"/>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: F }}>{t('sessions','includedFiles')} ({course.pdfs.length})</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
              {course.pdfs.map((pdf: any) => (
                <div key={pdf.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.75rem 1rem', background: 'var(--surface)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <FileText size={16}/>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 .1rem', fontWeight: 600, fontSize: '.85rem', color: 'var(--text)', fontFamily: F }}>{pdf.name}</p>
                      <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)', fontFamily: F }}>{pdf.size}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem' }}>
                    <button type="button" onClick={() => setActivePdfUrl(activePdfUrl === pdf.url ? null : pdf.url)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontFamily: F }}>
                      <Eye size={13}/> {activePdfUrl === pdf.url ? 'Fermer' : t('sessions','open')}
                    </button>
                    <a href={pdf.url} download={pdf.name} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '.3rem', fontFamily: F }}>
                      <Download size={13}/> {t('sessions','download')}
                    </a>
                    {isTeacher && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={deletingFileId === String(pdf.id)}
                        onClick={() => deleteCourseFile(pdf)}
                        style={{ fontFamily: F }}
                      >
                        {deletingFileId === String(pdf.id) ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {course.pdfs.length === 0 && (
              <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--text-3)', fontFamily: F }}>
                No PDF files found for this course yet.
              </p>
            )}

            {activePdfUrl && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: 'var(--text)', fontFamily: F }}>Lecteur PDF</h3>
                  <button onClick={() => setActivePdfUrl(null)} type="button" className="btn btn-outline btn-sm" style={{ fontFamily: F }}>Fermer</button>
                </div>
                <div style={{ width: '100%', height: '600px', borderRadius: 'var(--r-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <iframe src={`${activePdfUrl}#toolbar=0`} width="100%" height="100%" style={{ border: 'none' }} title="PDF Viewer" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Students who viewed / Enrolled */}
        <div>
          <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'sticky', top: '1.5rem' }}>
            <div style={{ padding: '1.35rem', background: 'var(--sidebar-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginBottom: '.5rem' }}>
                <Users size={18} color="var(--primary)"/>
                <p style={{ fontWeight: 700, color: 'var(--sidebar-text)', fontSize: '1rem', margin: 0, fontFamily: F }}>
                  {isTeacher ? t('sessions','studentsViewed') : t('sessions','courseAuthor')}
                </p>
              </div>
            </div>

            <div style={{ padding: '0' }}>
              {isTeacher ? (
                course.students.length > 0 ? (
                  course.students.map((student: any, i: number) => (
                    <div key={student.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem', padding: '1rem 1.35rem', borderBottom: i < course.students.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="av av-sm" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                        <User size={14} color="var(--text-2)"/>
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 .1rem', fontWeight: 600, fontSize: '.85rem', color: 'var(--text)', fontFamily: F }}>{student.name}</p>
                        <p style={{ margin: 0, fontSize: '.75rem', color: 'var(--text-3)', fontFamily: F }}>{student.level}</p>
                      </div>
                      <div style={{ fontSize: '.7rem', color: 'var(--text-4)', fontFamily: F }}>
                        Il y a {Math.floor((Date.now() - new Date(student.viewed_at).getTime()) / 3600000)}h
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ padding: '1.5rem', textAlign: 'center', margin: 0, fontSize: '.85rem', color: 'var(--text-3)', fontFamily: F }}>{t('sessions','noStudentsYet')}</p>
                )
              ) : (
                <div style={{ padding: '1.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.85rem' }}>
                    <div className="av av-lg" style={{ boxShadow: '0 4px 10px var(--primary-shadow)' }}>
                      {s.teacher?.full_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.95rem', margin: '0 0 .2rem', fontFamily: F }}>{s.teacher?.full_name || 'Prof. Anonyme'}</p>
                      <p style={{ fontSize: '.8rem', color: 'var(--text-3)', margin: 0, fontFamily: F }}>
                        {s.teacher?.specialty || 'Mathématiques'}
                      </p>
                    </div>
                  </div>
                  <Link href={s.teacher?.id ? `/dashboard/teachers/${s.teacher.id}` : '#'} className="btn btn-primary btn-md" style={{ marginTop: '1rem', width: '100%', justifyContent: 'center', fontFamily: F }}>
                    {t('teachers','viewProfile')}
                  </Link>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 .45rem', fontWeight: 700, color: 'var(--text)', fontSize: '.85rem', fontFamily: F }}>
                      {t('sessionDetail', 'leaveReview')}
                    </p>
                    <p style={{ margin: '0 0 .7rem', color: 'var(--text-3)', fontSize: '.75rem', fontFamily: F }}>
                      {t('sessionDetail', 'rateTeacher')}
                    </p>

                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: '.2rem', marginBottom: '.75rem' }}
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((v) => {
                        const active = v <= (hoveredRating || rating)
                        return (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setRating(v)}
                            onMouseEnter={() => setHoveredRating(v)}
                            aria-label={`Rate ${v} out of 5`}
                            style={{ background: 'none', border: 'none', padding: '.1rem', lineHeight: 1 }}
                          >
                            <Star
                              size={20}
                              color={active ? '#f59e0b' : 'var(--text-4)'}
                              fill={active ? '#f59e0b' : 'none'}
                            />
                          </button>
                        )
                      })}
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={saveRating}
                      disabled={rating < 1}
                      style={{ width: '100%', fontFamily: F }}
                    >
                      {t('sessionDetail', 'submitReview')}
                    </button>

                    {saved && (
                      <p style={{ margin: '.55rem 0 0', color: '#16a34a', fontSize: '.73rem', fontWeight: 600, fontFamily: F }}>
                        {t('sessionDetail', 'ratingSaved')}
                      </p>
                    )}
                  </div>

                  {/* Required by mission: upload a file linked to the interaction */}
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <p style={{ margin: '0 0 .45rem', fontWeight: 700, color: 'var(--text)', fontSize: '.85rem', fontFamily: F }}>
                      Document (Storage)
                    </p>
                    <p style={{ margin: '0 0 .75rem', color: 'var(--text-3)', fontSize: '.75rem', fontFamily: F }}>
                      Upload un PDF/image lié à ton interaction (Table C).
                    </p>

                    {uploadErr && (
                      <div className="err-box" style={{ display: 'flex', gap: '.6rem', marginBottom: '.75rem' }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '.05rem' }} />
                        <p style={{ margin: 0, fontWeight: 600, fontFamily: F }}>{uploadErr}</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.65rem' }}>
                      <label className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontFamily: F, cursor: 'pointer' }}>
                        <Upload size={14} /> Choisir un fichier
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => setDoc(e.target.files?.[0] ?? null)}
                        />
                      </label>
                      <span style={{ fontSize: '.75rem', color: 'var(--text-3)', fontFamily: F, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc ? doc.name : 'Aucun fichier'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={uploadInteractionDoc}
                      disabled={!doc || uploading || !s?.id}
                      style={{ width: '100%', justifyContent: 'center', fontFamily: F }}
                    >
                      {uploading ? <Loader2 size={16} className="spin" /> : 'Uploader'}
                    </button>

                    {uploadOk && (
                      <p style={{ margin: '.55rem 0 0', color: '#16a34a', fontSize: '.73rem', fontWeight: 700, fontFamily: F }}>
                        <CheckCircle size={14} style={{ verticalAlign: 'text-bottom', marginInlineEnd: '.3rem' }} />
                        Upload réussi
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

