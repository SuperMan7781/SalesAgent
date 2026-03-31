'use client'
// s:\Dev\Work\SalesAgent\frontend\src\components\UsageMeter.tsx

interface UsageMeterProps {
    label: string
    current: number
    max: number
}

export default function UsageMeter({ label, current, max }: UsageMeterProps) {
    const percentage = Math.min((current / max) * 100, 100)
    const color = percentage > 90 ? 'var(--danger)' : percentage > 75 ? 'var(--warning)' : 'var(--success)'

    return (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="mono" style={{ color }}>{current}/{max}</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: 2, transition: 'width 0.3s' }} />
            </div>
        </div>
    )
}
