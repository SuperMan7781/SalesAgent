'use client'
// s:\Dev\Work\SalesAgent\frontend\src\components\UpgradeModal.tsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    featureName: string
    requiredPlan: 'growth' | 'pro' | 'enterprise'
}

const PLAN_FEATURES: Record<string, string[]> = {
    growth: ['50 leads/day', 'Full email sending volume', '2 team seats', '3 inbox domains'],
    pro: ['100 leads/day', 'Multi-step follow-ups', 'HubSpot CRM sync', 'Tone learning', '5 team seats'],
    enterprise: ['300 leads/day', 'Full autopilot mode', 'All CRM integrations', 'API access', 'Unlimited seats'],
}

const PLAN_PRICES: Record<string, string> = {
    growth: '₹25,000/month',
    pro: '₹45,000/month',
    enterprise: '₹1,00,000+/month',
}

export default function UpgradeModal({ isOpen, onClose, featureName, requiredPlan }: UpgradeModalProps) {
    const planLabel = requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="glass-card"
                        style={{ padding: 32, maxWidth: 440, width: '100%' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontSize: 20, fontWeight: 700 }}>🚀 Unlock {featureName}</h2>
                            <button id="upgrade-modal-close" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>
                            {featureName} is available on the {planLabel} plan.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                            {PLAN_FEATURES[requiredPlan]?.map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                                    <Check size={16} style={{ color: 'var(--success)' }} />
                                    <span>{f}</span>
                                </div>
                            ))}
                        </div>
                        <p style={{ fontWeight: 600, marginBottom: 20 }}>
                            {PLAN_PRICES[requiredPlan]} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: 12 }}>(save 20% with annual)</span>
                        </p>
                        <div style={{ display: 'flex', gap: 12 }}>
                            <button id={`upgrade-to-${requiredPlan}-btn`} className="btn-primary" style={{ flex: 1 }}>Upgrade to {planLabel}</button>
                            <button className="btn-secondary" onClick={onClose}>Maybe Later</button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
