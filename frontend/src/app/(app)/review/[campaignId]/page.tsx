'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\review\[campaignId]\page.tsx
import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, SkipForward, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { apiGet, apiPut } from '@/lib/api'
import { toast } from 'sonner'

const QUALITY_COLORS: Record<string, string> = {
    rich: 'var(--success)', partial: 'var(--warning)', thin: 'var(--danger)', unknown: 'var(--text-secondary)'
}

export default function ReviewQueuePage() {
    const { campaignId } = useParams<{ campaignId: string }>()
    const [leads, setLeads] = useState<any[]>([])
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const [activeVariant, setActiveVariant] = useState(0)
    const [editedSubject, setEditedSubject] = useState('')
    const [editedBody, setEditedBody] = useState('')

    useEffect(() => {
        apiGet(`/api/leads/campaign/${campaignId}?review_status=pending`)
            .then(r => { setLeads(r.leads || []); setLoading(false) })
            .catch(() => setLoading(false))
    }, [campaignId])

    const currentLead = leads[selectedIndex]
    const drafts = currentLead?.email_drafts
        ? (typeof currentLead.email_drafts === 'string' ? JSON.parse(currentLead.email_drafts) : currentLead.email_drafts)
        : []
    const currentDraft = drafts[activeVariant]

    useEffect(() => {
        if (currentDraft) {
            setEditedSubject(currentDraft.subject || '')
            setEditedBody(currentDraft.body || '')
        }
    }, [selectedIndex, activeVariant, currentDraft?.subject])

    const takeAction = useCallback(async (review_status: string) => {
        if (!currentLead) return
        try {
            await apiPut(`/api/leads/${currentLead.id}/review`, {
                review_status,
                selected_variant: activeVariant + 1,
                edited_subject: editedSubject,
                edited_body: editedBody,
            })
            toast.success(`Lead ${review_status}`)
            setLeads(prev => prev.filter((_, i) => i !== selectedIndex))
            setSelectedIndex(prev => Math.min(prev, leads.length - 2))
        } catch {
            toast.error('Action failed')
        }
    }, [currentLead, activeVariant, editedSubject, editedBody, selectedIndex, leads.length])

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key === 'a' || e.key === 'A') takeAction('approved')
            if (e.key === 'r' || e.key === 'R') takeAction('rejected')
            if (e.key === 's' || e.key === 'S') takeAction('skipped')
            if (e.key === 'ArrowRight') setSelectedIndex(i => Math.min(i + 1, leads.length - 1))
            if (e.key === 'ArrowLeft') setSelectedIndex(i => Math.max(i - 1, 0))
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [takeAction, leads.length])

    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}</div>
    if (!leads.length) return (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Check size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h2 style={{ fontWeight: 600 }}>All caught up!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>No pending leads to review.</p>
        </div>
    )

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>Review Queue</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>{leads.length} leads pending • Shortcuts: A approve · R reject · S skip · ← → navigate</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => setSelectedIndex(i => Math.max(i - 1, 0))} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selectedIndex + 1} / {leads.length}</span>
                    <button onClick={() => setSelectedIndex(i => Math.min(i + 1, leads.length - 1))} className="btn-secondary" style={{ padding: '8px 12px' }}><ChevronRight size={16} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, height: 'calc(100vh - 200px)' }}>
                {/* Lead List */}
                <div className="glass-card" style={{ padding: 16, overflowY: 'auto' }}>
                    {leads.map((lead, i) => (
                        <div key={lead.id} id={`lead-item-${i}`} onClick={() => setSelectedIndex(i)} style={{
                            padding: '12px', borderRadius: 8, cursor: 'pointer', marginBottom: 4,
                            background: i === selectedIndex ? 'var(--bg-tertiary)' : 'transparent',
                            borderLeft: i === selectedIndex ? '3px solid var(--accent-primary)' : '3px solid transparent',
                            transition: 'all 0.15s',
                        }}>
                            <div style={{ fontWeight: 500, fontSize: 14 }}>{lead.first_name} {lead.last_name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{lead.title} @ {lead.company}</div>
                            <div style={{ marginTop: 6 }}>
                                <span className="status-pill" style={{ background: `${QUALITY_COLORS[lead.lead_quality] || 'var(--text-secondary)'}20`, color: QUALITY_COLORS[lead.lead_quality] || 'var(--text-secondary)', fontSize: 10 }}>
                                    {lead.lead_quality || 'unknown'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Email Preview */}
                {currentLead && (
                    <div className="glass-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                        {/* Variant Tabs */}
                        {drafts.length > 0 && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                {drafts.map((_: any, i: number) => (
                                    <button key={i} id={`variant-tab-${i}`} onClick={() => setActiveVariant(i)} style={{
                                        padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13,
                                        background: i === activeVariant ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                        color: i === activeVariant ? 'white' : 'var(--text-secondary)',
                                    }}>Variant {i + 1}</button>
                                ))}
                            </div>
                        )}

                        {/* Subject */}
                        <div>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Subject Line</label>
                            <input value={editedSubject} onChange={e => setEditedSubject(e.target.value)} style={{
                                width: '100%', padding: '10px 14px', borderRadius: 8, fontWeight: 600,
                                background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14,
                            }} />
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email Body</label>
                            <textarea value={editedBody} onChange={e => setEditedBody(e.target.value)} style={{
                                width: '100%', height: 220, padding: '12px 14px', borderRadius: 8,
                                background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14,
                                resize: 'vertical', lineHeight: 1.6,
                            }} />
                        </div>

                        {/* Quality Score */}
                        {currentLead.quality_score && (
                            <div style={{ display: 'flex', gap: 12 }}>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quality: <strong style={{ color: 'var(--success)' }}>{currentLead.quality_score}/10</strong></span>
                                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Spam Risk: <strong style={{ color: 'var(--warning)' }}>{currentLead.spam_score}/10</strong></span>
                            </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button id="approve-btn" onClick={() => takeAction('approved')} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Check size={16} /> Approve (A)
                            </button>
                            <button id="reject-btn" onClick={() => takeAction('rejected')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <X size={16} /> Reject (R)
                            </button>
                            <button id="skip-btn" onClick={() => takeAction('skipped')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <SkipForward size={16} /> Skip (S)
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
