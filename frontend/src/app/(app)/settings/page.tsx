'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\settings\page.tsx
import { useState, useEffect } from 'react'
import { apiGet, apiPut } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const TONE_OPTIONS = ['casual', 'professional', 'bold']

export default function SettingsPage() {
    const [form, setForm] = useState({ full_name: '', company_name: '', value_proposition: '', tone_preset: 'professional' })
    const [icp, setIcp] = useState({ industries: '', company_sizes: '', target_roles: '' })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    useEffect(() => {
        apiGet('/api/auth/me').then((data: any) => {
            setForm({
                full_name: data.full_name || '',
                company_name: data.company_name || '',
                value_proposition: data.value_proposition || '',
                tone_preset: data.tone_preset || 'professional',
            })
            setLoading(false)
        }).catch(() => setLoading(false))
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            await apiPut('/api/auth/profile', form)
            toast.success('Settings saved!')
        } catch {
            toast.error('Failed to save settings')
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>{[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 64 }} />)}</div>

    return (
        <div style={{ maxWidth: 680 }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>Settings</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Configure how SalesAgent represents you</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Profile */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontWeight: 600, marginBottom: 20, fontSize: 16 }}>Profile</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {[
                            { label: 'Full Name', key: 'full_name', placeholder: 'John Smith' },
                            { label: 'Company Name', key: 'company_name', placeholder: 'Acme Corp' },
                        ].map(f => (
                            <div key={f.key}>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{f.label}</label>
                                <input value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14 }} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Value Proposition */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>Value Proposition</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>Used by the AI to craft your email pitch. Be specific about who you help and how.</p>
                    <textarea
                        id="value-prop-input"
                        value={form.value_proposition}
                        onChange={e => setForm(p => ({ ...p, value_proposition: e.target.value }))}
                        placeholder="We help Series A–C SaaS companies reduce churn by 30% using AI-powered customer success workflows..."
                        rows={4}
                        style={{ width: '100%', padding: '12px 14px', borderRadius: 8, background: 'var(--bg-tertiary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, resize: 'vertical', lineHeight: 1.6 }}
                    />
                </div>

                {/* Tone Preset */}
                <div className="glass-card" style={{ padding: 24 }}>
                    <h2 style={{ fontWeight: 600, marginBottom: 16, fontSize: 16 }}>Default Email Tone</h2>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {TONE_OPTIONS.map(t => (
                            <button key={t} id={`tone-${t}`} onClick={() => setForm(p => ({ ...p, tone_preset: t }))} style={{
                                flex: 1, padding: '12px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 14, fontWeight: 500, textTransform: 'capitalize',
                                background: form.tone_preset === t ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                color: form.tone_preset === t ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.15s',
                            }}>{t}</button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
                    <button id="save-settings-btn" onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, padding: '14px', fontSize: 15 }}>
                        {saving ? 'Saving…' : 'Save Settings'}
                    </button>
                    <button id="sign-out-btn" onClick={handleSignOut} className="btn-secondary" style={{ padding: '14px 24px', fontSize: 15, color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}
