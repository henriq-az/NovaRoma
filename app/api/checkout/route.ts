import { MercadoPagoConfig, Preference } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const { itens, email, cupomId } = await request.json()

  if (!itens || itens.length === 0) {
    return Response.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  const supabase = getServiceSupabase()
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  const subtotal = itens.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0)

  // Resolve cupom se fornecido
  let desconto = 0
  let cupomValido: { id: number; tipo: string; valor: number } | null = null

  if (cupomId) {
    const { data: cupom } = await supabase
      .from('cupons')
      .select('id, tipo, valor, ativo, valido_ate, uso_maximo, usos_atuais')
      .eq('id', cupomId)
      .single()

    const ainda_valido =
      cupom &&
      cupom.ativo &&
      (!cupom.valido_ate || new Date(cupom.valido_ate) >= new Date()) &&
      (cupom.uso_maximo === null || cupom.usos_atuais < cupom.uso_maximo)

    if (ainda_valido) {
      cupomValido = { id: cupom.id, tipo: cupom.tipo, valor: Number(cupom.valor) }
      desconto =
        cupom.tipo === 'percentual'
          ? Math.min(subtotal * (Number(cupom.valor) / 100), subtotal)
          : Math.min(Number(cupom.valor), subtotal)
      desconto = Math.round(desconto * 100) / 100
    }
  }

  const totalFinal = Math.max(0, subtotal - desconto)

  const preference = new Preference(mp)
  const pref = await preference.create({
    body: {
      items: [{
        id: 'pedido',
        title: 'Pedido Nova Roma',
        quantity: 1,
        unit_price: totalFinal,
        currency_id: 'BRL',
      }],
      payer: email ? { email } : undefined,
      back_urls: {
        success: `${baseUrl}/pedido/sucesso`,
        failure: `${baseUrl}/pedido/falha`,
        pending: `${baseUrl}/pedido/pendente`,
      },
      notification_url: `${baseUrl}/api/webhook/mercadopago`,
    },
  })

  const pedidoInsert: Record<string, unknown> = {
    mp_preference_id: pref.id,
    status:  'pendente',
    total:   totalFinal,
    desconto,
  }
  if (cupomValido) pedidoInsert.cupom_id = cupomValido.id

  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .insert(pedidoInsert)
    .select()
    .single()

  if (pedidoErr || !pedido) {
    return Response.json({ error: 'Erro ao salvar pedido' }, { status: 500 })
  }

  const itensPedido = itens.map((item: { produto_id: number; name: string; tamanho: string; price: number; qty: number }) => ({
    pedido_id:  pedido.id,
    produto_id: item.produto_id,
    titulo:     item.name,
    tamanho:    item.tamanho,
    quantidade: item.qty,
    preco_unit: item.price,
  }))

  await supabase.from('itens_pedido').insert(itensPedido)

  return Response.json({ checkout_url: pref.init_point })
}
