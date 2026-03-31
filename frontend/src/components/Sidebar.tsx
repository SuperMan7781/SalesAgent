'use client'
// s:\Dev\Work\SalesAgent\frontend\src\components\Sidebar.tsx
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Rocket, Mail, BarChart3, Settings, CreditCard, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_ITEMS = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Rocket, label: 'Campaigns', href: '/campaigns' },
    { icon: Mail, label: 'Review Queue', href: '/review' },
    { icon: BarChart3, label: 'Analytics', href: '/analytics' },
    { divider: true },
    { icon: Settings, label: 'Settings', href: '/settings' },
    { icon: CreditCard, label: 'Billing', href: '/billing' },
    { icon: HelpCircle, label: 'Help', href: '/help' },
]

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const pathname = usePathname()

    return (
        <motion.aside
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.2 }}
            style={{
                height: '100vh',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 8px',
                position: 'fixed',
                left: 0,
                top: 0,
                zIndex: 50,
            }}
        >
            {/* Logo */}
            <div style={{ padding: '0 8px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: 'white', flexShrink: 0 }}>S</div>
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>
                            SalesAgent
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            {/* Nav items */}
            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {NAV_ITEMS.map((item, i) => {
                    if ('divider' in item) return <div key={i} style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
                    const Icon = item.icon!
                    const active = pathname === item.href
                    return (
                        <Link key={item.href} href={item.href!} style={{ textDecoration: 'none' }}>
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '10px 12px', borderRadius: 8,
                                background: active ? 'var(--bg-tertiary)' : 'transparent',
                                color: active ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                transition: 'all 0.15s',
                                cursor: 'pointer',
                            }}>
                                <Icon size={20} style={{ flexShrink: 0 }} />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 14, fontWeight: active ? 600 : 500, whiteSpace: 'nowrap' }}>
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    )
                })}
            </nav>

            {/* Collapse toggle */}
            <button onClick={() => setCollapsed(!collapsed)} style={{
                background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                borderRadius: 8, padding: 8, cursor: 'pointer', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
        </motion.aside>
    )
}
