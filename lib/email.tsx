import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { ReactElement } from 'react'

export type EmailTipo = 'order_confirmation' | 'welcome'

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function sendEmail({
  to,
  subject,
  react,
  pedidoId,
  tipo,
}: {
  to: string
  subject: string
  react: ReactElement
  pedidoId?: string
  tipo: EmailTipo
}): Promise<{ ok: boolean; resendId?: string; error?: string }> {
  const resend = getResend()
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not configured' }

  const supabase = getServiceSupabase()

  try {
    const { data, error } = await resend.emails.send({
      from: 'Nova Roma <onboarding@resend.dev>',
      to,
      subject,
      react,
    })

    await supabase.from('email_logs').insert({
      pedido_id: pedidoId ?? null,
      email: to,
      tipo,
      status: error ? 'failed' : 'sent',
      resend_id: data?.id ?? null,
      erro: error ? JSON.stringify(error) : null,
    })

    if (error) return { ok: false, error: JSON.stringify(error) }
    return { ok: true, resendId: data?.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    try {
      await supabase.from('email_logs').insert({
        pedido_id: pedidoId ?? null,
        email: to,
        tipo,
        status: 'failed',
        erro: msg,
      })
    } catch { /* log failure is non-critical */ }
    return { ok: false, error: msg }
  }
}
