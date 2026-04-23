import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function getResend() {
  const key = process.env.RESEND_API_KEY
  return key ? new Resend(key) : null
}

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

      const resend = getResend()
      const email = clienteData.email_cliente as string | undefined
      if (email && resend) {
        try {
          const { data: itensCompletos } = await supabase
            .from('itens_pedido')
            .select('titulo, tamanho, quantidade, preco_unit')
            .eq('pedido_id', pedido.id)

          const nome = (clienteData.nome_cliente as string | undefined) ?? 'Cliente'
          const total = itensCompletos?.reduce((acc: number, i: { quantidade: number; preco_unit: number }) => acc + i.quantidade * i.preco_unit, 0) ?? 0

          const linhasItens = itensCompletos?.map((i: { titulo: string; tamanho: string; quantidade: number; preco_unit: number }) =>
            `<tr><td style="padding:6px 12px;border-bottom:1px solid #e8d9c4">${i.titulo}</td><td style="padding:6px 12px;border-bottom:1px solid #e8d9c4;text-align:center">${i.tamanho}</td><td style="padding:6px 12px;border-bottom:1px solid #e8d9c4;text-align:center">${i.quantidade}</td><td style="padding:6px 12px;border-bottom:1px solid #e8d9c4;text-align:right">R$ ${Number(i.preco_unit).toFixed(2).replace('.', ',')}</td></tr>`
          ).join('') ?? ''

          const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5ede0;font-family:sans-serif">
<div style="max-width:560px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden">
  <div style="background:#3d2010;padding:28px 32px;text-align:center">
    <p style="color:#c49a6c;font-size:1.3rem;font-weight:700;margin:0;letter-spacing:.15em">NOVA ROMA</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#3d2010;margin-top:0">Pedido confirmado, ${nome}!</h2>
    <p style="color:#555">Seu pagamento foi aprovado. Em breve você receberá informações sobre a entrega.</p>
    <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:.9rem">
      <thead><tr style="background:#f5ede0">
        <th style="padding:8px 12px;text-align:left">Produto</th>
        <th style="padding:8px 12px">Tamanho</th>
        <th style="padding:8px 12px">Qtd</th>
        <th style="padding:8px 12px;text-align:right">Preço</th>
      </tr></thead>
      <tbody>${linhasItens}</tbody>
    </table>
    <p style="text-align:right;font-weight:700;color:#3d2010;font-size:1.05rem">Total: R$ ${total.toFixed(2).replace('.', ',')}</p>
    <hr style="border:none;border-top:1px solid #e8d9c4;margin:24px 0">
    <p style="color:#888;font-size:.8rem;text-align:center">Nova Roma — Streetwear Pernambucano · Recife, PE</p>
  </div>
</div>
</body></html>`

          await resend.emails.send({
            from: 'Nova Roma <pedidos@novaroma.com.br>',
            to: email,
            subject: 'Pedido confirmado — Nova Roma',
            html,
          })
        } catch {
          // email failure must not break webhook
        }
      }
    }
  }

  return Response.json({ ok: true })
}
