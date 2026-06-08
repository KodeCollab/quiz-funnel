import { getSupabaseClient } from './client'
import { FunnelConfig, Submission } from '../quiz-engine/types'

export async function getFunnelBySlug(slug: string): Promise<FunnelConfig | null> {
  const supabase = getSupabaseClient()
  console.log(`[getFunnelBySlug] Looking for slug: ${slug}`)

  const { data, error } = await supabase
    .from('funnels')
    .select('id, slug, name, config, active, google_sheets_id, webhook_url')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error(`[getFunnelBySlug] Database error for slug "${slug}":`, error)
    return null
  }

  if (!data) {
    console.error(`[getFunnelBySlug] No data returned for slug: ${slug}`)
    return null
  }

  console.log(`[getFunnelBySlug] Found funnel:`, { id: data.id, slug: data.slug, active: data.active })

  if (!data.active) {
    console.warn(`[getFunnelBySlug] Funnel is inactive for slug: ${slug}`)
    return null
  }

  try {
    const { id: _configId, ...configRest } = data.config || {}
    const result: FunnelConfig = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      ...configRest,
    }
    console.log(`[getFunnelBySlug] Returning funnel config with ${result.steps?.length || 0} steps`)
    return result
  } catch (err) {
    console.error(`[getFunnelBySlug] Error processing config:`, err)
    return null
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
  console.log(`[updateFunnel] Saving funnel ${funnelId}`, { steps: config.steps?.length || 0 })

  const { error, data } = await supabase
    .from('funnels')
    .update({ config, updated_at: new Date().toISOString() })
    .eq('id', funnelId)
    .select()

  if (error) {
    console.error(`[updateFunnel] Save failed for ${funnelId}:`, error)
    return false
  }

  console.log(`[updateFunnel] Save successful for ${funnelId}`)
  return true
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

export async function deleteFunnel(funnelId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('funnels')
    .delete()
    .eq('id', funnelId)

  return !error
}
