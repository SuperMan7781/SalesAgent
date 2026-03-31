'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\dashboard\page.tsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, MessageSquare, Calendar, TrendingUp, Plus, Rocket } from 'lucide-react'
import Link from 'next/link'
import { apiGet } from '@/lib/api'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        const duration = 800
        const steps = 30
        const increment = value / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= value) { setCount(value); clearInterval(timer) }
            else setCount(Math.floor(current))
        }, duration / steps)
        return () => clearInterval(timer)
    }, [value])
    return <span className="mono">{count.toLocaleString()}{suffix}</span>
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet('/api/analytics/dashboard')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const metrics = [
        { icon: Send, label: 'Emails Sent', value: stats?.total_sent || 0, color: 'var(--accent-primary)' },
        { icon: MessageSquare, label: 'Reply Rate', value: stats?.reply_rate || 0, suffix: '%', color: 'var(--success)' },
        { icon: Calendar, label: 'Meetings Booked', value: stats?.total_meetings || 0, color: 'var(--warning)' },
        { icon: TrendingUp, label: 'ROI', value: stats?.total_sent ? Math.round((stats?.total_meetings || 0) / (stats?.total_sent || 1) * 1000) : 0, suffix: 'x', color: 'var(--accent-secondary)' },
    ]

    return (
        <div>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700 }}>Command Center</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Your AI SDR performance at a glance</p>
                </div>
                <Link href="/campaigns/new">
                    <button id="new-campaign-btn" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Plus size={18} /> New Campaign
                    </button>
                </Link>
            </div>

            {/* Metric Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {metrics.map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card"
                        style={{ padding: 24 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <m.icon size={18} style={{ color: m.color }} />
                            <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
                        </div>
                        <div style={{ fontSize: 36, fontWeight: 800 }}>
                            {loading
                                ? <div className="skeleton" style={{ height: 40, width: 80 }} />
                                : <AnimatedCounter value={m.value} suffix={m.suffix} />
                            }
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Campaigns Table */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Active Campaigns</h2>
                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 48 }} />)}
                    </div>
                ) : stats?.campaigns?.length ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                {['Campaign', 'Leads', 'Status', 'Sent', 'Replies', 'Reply Rate'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {stats.campaigns.map((c: any) => (
                                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '12px' }}>
                                        <Link href={`/review/${c.id}`} style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link>
                                    </td>
                                    <td style={{ padding: '12px' }} className="mono">{c.total_leads}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span className="status-pill" style={{
                                            background: c.status === 'completed' ? 'rgba(16,185,129,0.1)' : c.status === 'processing' ? 'rgba(245,158,11,0.1)' : c.status === 'ready' ? 'rgba(59,130,246,0.1)' : 'rgba(156,163,175,0.1)',
                                            color: c.status === 'completed' ? 'var(--success)' : c.status === 'processing' ? 'var(--warning)' : c.status === 'ready' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                        }}>{c.status}</span>
                                    </td>
                                    <td style={{ padding: '12px' }} className="mono">{c.sent_count}</td>
                                    <td style={{ padding: '12px' }} className="mono">{c.replied_count}</td>
                                    <td style={{ padding: '12px' }} className="mono">{c.sent_count > 0 ? Math.round(c.replied_count / c.sent_count * 100) : 0}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    /* Empty state */
                    <div style={{ textAlign: 'center', padding: '48px 0' }}>
                        <Rocket size={48} style={{ color: 'var(--text-secondary)', marginBottom: 16 }} />
                        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Your first campaign awaits</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>Upload a CSV of leads and watch AI draft personalized emails in minutes.</p>
                        <Link href="/campaigns/new"><button className="btn-primary">Create First Campaign</button></Link>
                    </div>
                )}
            </div>
        </div>
    )
}
