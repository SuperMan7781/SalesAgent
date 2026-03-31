// s:\Dev\Work\SalesAgent\frontend\src\lib\plans.ts
export type PlanType = 'trial' | 'growth' | 'pro' | 'enterprise'

export const PLAN_LIMITS: Record<PlanType, {
    leads_per_day: number
    sends_per_day: number
    follow_ups: boolean
    crm: boolean | string
    team_seats: number
    domains: number
    ab_testing: boolean
    tone_learning: boolean
    autopilot: boolean
    api_access: boolean
    webhooks: boolean
}> = {
    trial: { leads_per_day: 50, sends_per_day: 10, follow_ups: false, crm: false, team_seats: 1, domains: 1, ab_testing: false, tone_learning: false, autopilot: false, api_access: false, webhooks: false },
    growth: { leads_per_day: 50, sends_per_day: 1200, follow_ups: false, crm: false, team_seats: 2, domains: 3, ab_testing: true, tone_learning: false, autopilot: false, api_access: false, webhooks: false },
    pro: { leads_per_day: 100, sends_per_day: 2400, follow_ups: true, crm: 'hubspot', team_seats: 5, domains: 5, ab_testing: true, tone_learning: true, autopilot: false, api_access: false, webhooks: true },
    enterprise: { leads_per_day: 300, sends_per_day: 7200, follow_ups: true, crm: 'all', team_seats: -1, domains: 10, ab_testing: true, tone_learning: true, autopilot: true, api_access: true, webhooks: true },
}

export function canAccess(feature: keyof typeof PLAN_LIMITS['trial'], plan: PlanType): boolean {
    const limits = PLAN_LIMITS[plan]
    const value = limits[feature]
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0
    return !!value
}
