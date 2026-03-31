'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\review\page.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, Inbox, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'

export default function ReviewIndexPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet('/api/analytics/dashboard')
            .then(data => setCampaigns(data?.campaigns || []))
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const reviewable = campaigns.filter(c => c.status === 'ready' || c.status === 'completed' || c.status === 'processing')

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Review Queue</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                    Select a campaign to review its AI-generated emails
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80 }} />)}
                </div>
            ) : reviewable.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '80px 0' }}
                >
                    <Inbox size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 16px' }} />
                    <h2 style={{ fontWeight: 600, marginBottom: 8 }}>No campaigns to review</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
                        Create a campaign first, then come back to review AI-drafted emails.
                    </p>
                    <Link href="/campaigns/new">
                        <button className="btn-primary">Create Campaign</button>
                    </Link>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reviewable.map((campaign, i) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link href={`/review/${campaign.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="glass-card" style={{
                                    padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <Mail size={18} style={{ color: 'white' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 15 }}>{campaign.name}</div>
                                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                                                {campaign.total_leads} leads •{' '}
                                                <span className="status-pill" style={{
                                                    background: campaign.status === 'ready' ? 'rgba(59,130,246,0.1)' : campaign.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                    color: campaign.status === 'ready' ? 'var(--accent-primary)' : campaign.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                                                    fontSize: 11,
                                                }}>{campaign.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ArrowRight size={18} style={{ color: 'var(--text-secondary)' }} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
