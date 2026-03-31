'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\billing\page.tsx
import { useState } from 'react'
import { Check } from 'lucide-react'
import { PLAN_LIMITS, type PlanType } from '@/lib/plans'

const PLANS: { key: PlanType; name: string; price: string; highlight?: boolean }[] = [
    { key: 'trial', name: 'Trial', price: 'Free (7 days)' },
    { key: 'growth', name: 'Growth', price: '₹25,000/mo' },
    { key: 'pro', name: 'Pro', price: '₹45,000/mo', highlight: true },
    { key: 'enterprise', name: 'Enterprise', price: '₹1,00,000+/mo' },
]

const FEATURE_ROWS: { label: string; key: keyof typeof PLAN_LIMITS['trial'] }[] = [
    { label: 'Leads/day', key: 'leads_per_day' },
    { label: 'Emails/day', key: 'sends_per_day' },
    { label: 'Team seats', key: 'team_seats' },
    { label: 'Domains', key: 'domains' },
    { label: 'Follow-ups', key: 'follow_ups' },
    { label: 'A/B Testing', key: 'ab_testing' },
    { label: 'Tone Learning', key: 'tone_learning' },
    { label: 'CRM Sync', key: 'crm' },
    { label: 'Autopilot Mode', key: 'autopilot' },
    { label: 'API Access', key: 'api_access' },
    { label: 'Webhooks', key: 'webhooks' },
]

function renderValue(val: any) {
    if (val === true) return <Check size={16} style={{ color: 'var(--success)' }} />
    if (val === false) return <span style={{ color: 'var(--text-secondary)' }}>—</span>
    if (val === -1) return <span style={{ color: 'var(--success)' }}>Unlimited</span>
    return <span className="mono" style={{ fontSize: 13 }}>{val}</span>
}

export default function BillingPage() {
    const currentPlan: PlanType = 'trial' // TODO: fetch from profile

    return (
        <div>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Billing</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Current plan: <strong style={{ color: 'var(--accent-primary)', textTransform: 'capitalize' }}>{currentPlan}</strong></p>
            </div>

            {/* Plan Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                {PLANS.map(plan => (
                    <div key={plan.key} className="glass-card" style={{
                        padding: 24, textAlign: 'center', position: 'relative',
                        border: plan.highlight ? '1px solid var(--accent-primary)' : undefined,
                    }}>
                        {plan.highlight && (
                            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-primary)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 12px', borderRadius: 999 }}>POPULAR</div>
                        )}
                        <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{plan.name}</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 16 }}>{plan.price}</div>
                        <button
                            id={`upgrade-${plan.key}-btn`}
                            disabled={plan.key === currentPlan}
                            className={plan.key === currentPlan ? 'btn-secondary' : 'btn-primary'}
                            style={{ width: '100%', opacity: plan.key === currentPlan ? 0.6 : 1 }}
                        >
                            {plan.key === currentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                        </button>
                    </div>
                ))}
            </div>

            {/* Feature Comparison Table */}
            <div className="glass-card" style={{ padding: 24, overflowX: 'auto' }}>
                <h2 style={{ fontWeight: 600, marginBottom: 20, fontSize: 16 }}>Plan Comparison</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '8px 12px', fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>Feature</th>
                            {PLANS.map(p => (
                                <th key={p.key} style={{ textAlign: 'center', padding: '8px 12px', fontSize: 13, color: p.key === currentPlan ? 'var(--accent-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>{p.name}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {FEATURE_ROWS.map(row => (
                            <tr key={row.key} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '10px 12px', fontSize: 13 }}>{row.label}</td>
                                {PLANS.map(plan => (
                                    <td key={plan.key} style={{ textAlign: 'center', padding: '10px 12px' }}>
                                        {renderValue(PLAN_LIMITS[plan.key][row.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
