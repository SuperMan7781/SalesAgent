'use client'
// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\campaigns\new\page.tsx
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, FileText, X } from 'lucide-react'
import { uploadCSV } from '@/lib/api'
import { toast } from 'sonner'

export default function NewCampaignPage() {
    const router = useRouter()
    const [file, setFile] = useState<File | null>(null)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [dragging, setDragging] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        const dropped = e.dataTransfer.files[0]
        if (dropped?.name.endsWith('.csv')) setFile(dropped)
        else toast.error('Please upload a .csv file')
    }

    const handleSubmit = async () => {
        if (!file || !name.trim()) {
            toast.error('Please add a campaign name and upload a CSV')
            return
        }
        setLoading(true)
        try {
            const result = await uploadCSV(name, file)
            toast.success(`Campaign created! ${result.leads_count} leads queued for processing.`)
            router.push(`/review/${result.campaign_id}`)
        } catch (e: any) {
            toast.error(e.message || 'Upload failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700 }}>New Campaign</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Upload a CSV and the 5-agent pipeline will draft personalized emails for every lead.</p>
            </div>

            <div className="glass-card" style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Campaign Name */}
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Campaign Name</label>
                    <input
                        id="campaign-name-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Q1 SaaS Outreach"
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: 8,
                            background: 'var(--bg-tertiary)', border: '1px solid var(--border)',
                            color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                        }}
                    />
                </div>

                {/* CSV Drop Zone */}
                <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Lead CSV File</label>
                    <motion.div
                        onDragOver={e => { e.preventDefault(); setDragging(true) }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                        animate={{ borderColor: dragging ? 'var(--accent-primary)' : 'var(--border)', background: dragging ? 'rgba(59,130,246,0.05)' : 'var(--bg-tertiary)' }}
                        style={{
                            border: '2px dashed var(--border)', borderRadius: 12,
                            padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                    >
                        <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] || null)} />
                        {file ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <FileText size={20} style={{ color: 'var(--accent-primary)' }} />
                                <span style={{ fontWeight: 500 }}>{file.name}</span>
                                <button onClick={e => { e.stopPropagation(); setFile(null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload size={32} style={{ color: 'var(--text-secondary)', marginBottom: 12 }} />
                                <p style={{ fontWeight: 500, marginBottom: 4 }}>Drag & drop your CSV here</p>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>or click to browse — requires: first_name, last_name, email, company, title</p>
                            </>
                        )}
                    </motion.div>
                </div>

                <button id="create-campaign-submit" onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ fontSize: 15, padding: '14px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? 'Creating Campaign…' : '🚀 Launch Campaign'}
                </button>
            </div>
        </div>
    )
}
