'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\campaigns\page.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Rocket, Mail, Eye, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
    draft: { bg: 'rgba(156,163,175,0.1)', color: 'var(--text-secondary)' },
    processing: { bg: 'rgba(245,158,11,0.1)', color: 'var(--warning)' },
    ready: { bg: 'rgba(59,130,246,0.1)', color: 'var(--accent-primary)' },
    sending: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
    completed: { bg: 'rgba(16,185,129,0.1)', color: 'var(--success)' },
}

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet('/api/analytics/dashboard')
            .then(data => setCampaigns(data?.campaigns || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700 }}>Campaigns</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                        Manage your outreach campaigns
                    </p>
                </div>
                <Link href="/campaigns/new">
                    <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={18} /> New Campaign
                    </button>
                </Link>
            </div>

            {/* Campaign Cards */}
            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 180, borderRadius: 12 }} />)}
                </div>
            ) : campaigns.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '80px 0' }}
                >
                    <Rocket size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                    <h2 style={{ fontWeight: 600, marginBottom: 8 }}>No campaigns yet</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                        Upload a CSV of leads and let AI craft personalized emails.
                    </p>
                    <Link href="/campaigns/new">
                        <button className="btn-primary">Create First Campaign</button>
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
                    {campaigns.map((c, i) => {
                        const statusStyle = STATUS_STYLES[c.status] || STATUS_STYLES.draft
                        return (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card"
                                style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}
                            >
                                {/* Card Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{c.name}</h3>
                                        <span className="status-pill" style={{
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                            fontSize: 11,
                                        }}>{c.status}</span>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Leads</div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }} className="mono">{c.total_leads}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Sent</div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }} className="mono">{c.sent_count}</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2 }}>Replies</div>
                                        <div style={{ fontSize: 20, fontWeight: 700 }} className="mono">{c.replied_count}</div>
                                    </div>
                                </div>

                                {/* Reply Rate Bar */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Reply Rate</span>
                                        <span className="mono" style={{ fontWeight: 600 }}>
                                            {c.sent_count > 0 ? Math.round(c.replied_count / c.sent_count * 100) : 0}%
                                        </span>
                                    </div>
                                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${c.sent_count > 0 ? Math.round(c.replied_count / c.sent_count * 100) : 0}%` }}
                                            transition={{ duration: 0.8, delay: i * 0.05 }}
                                            style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }}
                                        />
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <Link href={`/review/${c.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                                        <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}>
                                            <Eye size={14} /> Review
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
