import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! })

function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: Request) {
  const body = await request.json()

  if (body.type !== 'payment') {
    return Response.json({ ok: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return Response.json({ ok: true })
  }

  const paymentClient = new Payment(mp)
  const payment = await paymentClient.get({ id: paymentId })

  const status = payment.status
  // preference_id is not typed in the SDK's PaymentResponse but is present at runtime
  const preferenceId = (payment as unknown as Record<string, unknown>).preference_id as string | undefined

  const supabase = getServiceSupabase()

  const { data: pedido } = await supabase
    .from('pedidos')
    .select('id')
    .eq('mp_preference_id', preferenceId)
    .single()

  if (!pedido) {
    return Response.json({ ok: true })
  }

  const novoStatus =
    status === 'approved' ? 'aprovado' :
    status === 'rejected' ? 'rejeitado' :
    status === 'cancelled' ? 'cancelado' : 'pendente'

  const { data: pedidoAtual } = await supabase
    .from('pedidos')
    .select('status')
    .eq('id', pedido.id)
    .single()

  const payer = (payment as unknown as Record<string, unknown>).payer as Record<string, unknown> | undefined
  const ship  = (payment as unknown as Record<string, unknown>).shipments as Record<string, unknown> | undefined
  const addr  = (ship?.receiver_address ?? payer?.address) as Record<string, unknown> | undefined

  const clienteData: Record<string, unknown> = { status: novoStatus, mp_payment_id: String(paymentId) }
  if (payer?.email)       clienteData.email_cliente     = payer.email
  if (payer?.first_name)  clienteData.nome_cliente      = [payer.first_name, payer.last_name].filter(Boolean).join(' ')
  if ((payer?.phone as Record<string, unknown>)?.number) {
    clienteData.telefone_cliente = String((payer!.phone as Record<string, unknown>).number)
  }
  if (addr) {
    clienteData.endereco = {
      zip_code:      addr.zip_code      ?? addr.zipCode,
      street_name:   addr.street_name   ?? addr.streetName,
      street_number: addr.street_number ?? addr.streetNumber,
      neighborhood:  addr.neighborhood,
      city:          addr.city          ?? (addr.city_name),
      state:         addr.state_name    ?? addr.state,
    }
  }

  await supabase
    .from('pedidos')
    .update(clienteData)
    .eq('id', pedido.id)

  if (pedidoAtual && pedidoAtual.status !== novoStatus) {
    await supabase.from('historico_pedido').insert({
      pedido_id:       String(pedido.id),
      status_anterior: pedidoAtual.status,
      status_novo:     novoStatus,
    })
  }

  if (novoStatus === 'aprovado') {
    const { data: itens } = await supabase
      .from('itens_pedido')
      .select('produto_id, tamanho, quantidade')
      .eq('pedido_id', pedido.id)

    if (itens) {
      for (const item of itens) {
        const { data: estoque } = await supabase
          .from('estoque_itens')
          .select('id, quantidade')
          .eq('produto_id', item.produto_id)
          .eq('tamanho', item.tamanho)
          .single()

        if (estoque) {
          await supabase
            .from('estoque_itens')
            .update({ quantidade: Math.max(0, estoque.quantidade - item.quantidade) })
            .eq('id', estoque.id)
        }
      }
    }
  }

  return Response.json({ ok: true })
}
