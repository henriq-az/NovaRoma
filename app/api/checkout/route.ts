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
  const { itens, email } = await request.json()

  if (!itens || itens.length === 0) {
    return Response.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin

  const preference = new Preference(mp)
  const pref = await preference.create({
    body: {
      items: itens.map((item: { name: string; price: number; qty: number; tamanho: string }) => ({
        title: `${item.name} (${item.tamanho})`,
        quantity: item.qty,
        unit_price: item.price,
        currency_id: 'BRL',
      })),
      payer: email ? { email } : undefined,
      back_urls: {
        success: `${baseUrl}/pedido/sucesso`,
        failure: `${baseUrl}/pedido/falha`,
        pending: `${baseUrl}/pedido/pendente`,
      },
      notification_url: `${baseUrl}/api/webhook/mercadopago`,
    },
  })

  const total = itens.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0)

  const supabase = getServiceSupabase()

  const { data: pedido, error: pedidoErr } = await supabase
    .from('pedidos')
    .insert({ mp_preference_id: pref.id, status: 'pendente', total })
    .select()
    .single()

  if (pedidoErr || !pedido) {
    console.error('Erro ao criar pedido:', pedidoErr)
    return Response.json({ error: 'Erro ao salvar pedido' }, { status: 500 })
  }

  const itensPedido = itens.map((item: { produto_id: number; name: string; tamanho: string; price: number; qty: number }) => ({
    pedido_id: pedido.id,
    produto_id: item.produto_id,
    nome: item.name,
    tamanho: item.tamanho,
    quantidade: item.qty,
    preco: item.price,
  }))

  await supabase.from('itens_pedido').insert(itensPedido)

  return Response.json({ checkout_url: pref.init_point })
}
