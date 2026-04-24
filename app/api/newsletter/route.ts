import { createClient } from '@supabase/supabase-js'
import React from 'react'
import { sendEmail } from '@/lib/email'
import { WelcomeEmail } from '@/emails/WelcomeEmail'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const { email } = await request.json()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'email_invalido' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const { error } = await supabase.from('newsletter').insert({ email })

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: 'ja_cadastrado' }, { status: 409 })
    }
    return Response.json({ error: 'erro_interno' }, { status: 500 })
  }

  // Fire-and-forget — não bloqueia a resposta
  sendEmail({
    to:      email,
    subject: 'Bem-vindo à Nova Roma',
    react:   React.createElement(WelcomeEmail, {}),
    tipo:    'welcome',
  }).catch(() => {})

  return Response.json({ ok: true })
}
