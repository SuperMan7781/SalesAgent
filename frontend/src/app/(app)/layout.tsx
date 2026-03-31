// s:\Dev\Work\SalesAgent\frontend\src\app\(app)\layout.tsx
import Sidebar from '@/components/Sidebar'
import { Toaster } from 'sonner'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, marginLeft: 240, padding: 32, maxWidth: 1280, margin: '0 auto 0 240px' }}>
                {children}
            </main>
            <Toaster position="bottom-right" richColors theme="dark" />
        </div>
    )
}
