import { getSupabaseClient } from './client'
import { FunnelConfig, Submission } from '../quiz-engine/types'

export async function getFunnelBySlug(slug: string): Promise<FunnelConfig | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('funnels')
    .select('id, slug, name, config, active, google_sheets_id, webhook_url')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (error) return null

  const { id: _configId, ...configRest } = data.config
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    ...configRest,
  }
}

export async function getAllFunnels(): Promise<FunnelConfig[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('funnels')
    .select('id, slug, name, config, active, google_sheets_id, webhook_url')
    .order('created_at', { ascending: false })

  if (error) return []

  return data.map((f) => {
    const { id: _configId, ...configRest } = f.config
    return {
      id: f.id,
      slug: f.slug,
      name: f.name,
      ...configRest,
    }
  })
}

export async function createSubmission(
  funnelId: string,
  sessionId: string,
  answers: Record<string, unknown>,
  leadScore: number,
  email?: string,
  phone?: string,
  name?: string,
  address?: Record<string, unknown>
): Promise<string | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('submissions')
    .insert({
      funnel_id: funnelId,
      session_id: sessionId,
      answers,
      lead_score: leadScore,
      email,
      phone,
      name,
      address,
      completed: true,
      submitted_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create submission:', error)
    return null
  }

  return data?.id || null
}

export async function getSubmissions(
  funnelId: string
): Promise<Submission[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('submitted_at', { ascending: false })

  if (error) return []

  return data.map((s) => ({
    id: s.id,
    funnelId: s.funnel_id,
    sessionId: s.session_id,
    answers: s.answers,
    leadScore: s.lead_score,
    email: s.email,
    phone: s.phone,
    name: s.name,
    address: s.address,
    completed: s.completed,
    submittedAt: s.submitted_at,
  }))
}

export async function updateFunnel(
  funnelId: string,
  config: Partial<FunnelConfig>
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('funnels')
    .update({ config, updated_at: new Date().toISOString() })
    .eq('id', funnelId)

  return !error
}

export async function createFunnel(config: FunnelConfig): Promise<string | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('funnels')
    .insert({
      slug: config.slug,
      name: config.name,
      config,
      active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Failed to create funnel:', error)
    return null
  }

  return data?.id || null
}
