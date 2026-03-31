// s:\Dev\Work\SalesAgent\frontend\src\lib\api.ts
import { supabase } from './supabase'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
    }
}

export async function apiGet(path: string) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, { headers })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

export async function apiPost(path: string, data?: any) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

export async function apiPut(path: string, data: any) {
    const headers = await getAuthHeaders()
    const res = await fetch(`${API_URL}${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    return res.json()
}

export async function uploadCSV(name: string, file: File) {
    const { data: { session } } = await supabase.auth.getSession()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', name)

    const res = await fetch(`${API_URL}/api/campaigns/?name=${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
        body: formData,
    })
    if (!res.ok) throw new Error(`Upload error: ${res.status}`)
    return res.json()
}
