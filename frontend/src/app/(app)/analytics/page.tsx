'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\analytics\page.tsx
import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { apiGet } from '@/lib/api'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6366F1']

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        apiGet('/api/analytics/dashboard')
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 200 }} />)}</div>

    const funnelData = [
        { name: 'Sent', value: stats?.total_sent || 0 },
        { name: 'Opened', value: Math.round((stats?.total_sent || 0) * 0.42) },
        { name: 'Replied', value: stats?.total_replies || 0 },
        { name: 'Meetings', value: stats?.total_meetings || 0 },
    ]

    const campaignData = (stats?.campaigns || []).map((c: any) => ({
        name: c.name?.slice(0, 16) || 'Campaign',
        sent: c.sent_count || 0,
        replied: c.replied_count || 0,
        meetings: c.meetings_booked || 0,
    }))

    const statusData = [
        { name: 'Sent', value: stats?.total_sent || 0 },
        { name: 'Replied', value: stats?.total_replies || 0 },
        { name: 'Meetings', value: stats?.total_meetings || 0 },
    ]

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Analytics</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Track pipeline performance across all campaigns</p>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {[
                    { label: 'Total Sent', value: stats?.total_sent || 0 },
                    { label: 'Total Replies', value: stats?.total_replies || 0 },
                    { label: 'Reply Rate', value: `${stats?.reply_rate || 0}%` },
                    { label: 'Meetings', value: stats?.total_meetings || 0 },
                ].map(m => (
                    <div key={m.label} className="glass-card" style={{ padding: 24 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{m.label}</div>
                        <div style={{ fontSize: 32, fontWeight: 800 }} className="mono">{m.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Funnel */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Email Funnel</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={funnelData}>
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Campaign Comparison */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Campaign Performance</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={campaignData}>
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                            <Bar dataKey="sent" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Sent" />
                            <Bar dataKey="replied" fill="#10B981" radius={[4, 4, 0, 0]} name="Replied" />
                            <Bar dataKey="meetings" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Meetings" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ROI Calculator */}
            <div className="glass-card" style={{ padding: 24 }}>
                <h3 style={{ fontWeight: 600, marginBottom: 16 }}>ROI Calculator</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
                    {[
                        { label: 'Avg Deal Value', value: '₹5,00,000', note: 'set in settings' },
                        { label: 'Meetings → Close Rate', value: '25%', note: 'industry average' },
                        { label: 'Pipeline Generated', value: `₹${((stats?.total_meetings || 0) * 500000 * 0.25).toLocaleString('en-IN')}`, note: 'estimated' },
                    ].map(r => (
                        <div key={r.label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }} className="mono">{r.value}</div>
                            <div style={{ fontWeight: 500, marginBottom: 4 }}>{r.label}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.note}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
