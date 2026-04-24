import { createClient } from '@supabase/supabase-js'

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const { codigo, total } = await request.json()

  if (!codigo || typeof total !== 'number') {
    return Response.json({ ok: false, error: 'dados_invalidos' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const { data: cupom } = await supabase
    .from('cupons')
    .select('*')
    .eq('codigo', codigo.toUpperCase().trim())
    .single()

  if (!cupom) return Response.json({ ok: false, error: 'nao_encontrado' })
  if (!cupom.ativo) return Response.json({ ok: false, error: 'inativo' })
  if (cupom.valido_ate && new Date(cupom.valido_ate) < new Date())
    return Response.json({ ok: false, error: 'expirado' })
  if (cupom.uso_maximo !== null && cupom.usos_atuais >= cupom.uso_maximo)
    return Response.json({ ok: false, error: 'esgotado' })

  const desconto =
    cupom.tipo === 'percentual'
      ? Math.min(total * (Number(cupom.valor) / 100), total)
      : Math.min(Number(cupom.valor), total)

  return Response.json({
    ok: true,
    cupomId: cupom.id,
    tipo: cupom.tipo,
    valor: Number(cupom.valor),
    desconto: Math.round(desconto * 100) / 100,
  })
}
