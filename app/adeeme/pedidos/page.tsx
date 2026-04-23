'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import '../admin.css'

type ItemPedido = {
  nome: string
  tamanho: string
  quantidade: number
  preco: number
}

type Pedido = {
  id: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado'
  total: number
  criado_em: string
  itens_pedido: ItemPedido[]
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: 'Pendente',  color: '#8a6200', bg: '#fff8e1' },
  aprovado:  { label: 'Aprovado',  color: '#1a6e3c', bg: '#e6f4ec' },
  rejeitado: { label: 'Rejeitado', color: '#CC0000', bg: '#fdecea' },
  cancelado: { label: 'Cancelado', color: '#666',    bg: '#f5f5f5' },
}

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [filtro, setFiltro] = useState<string>('todos')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .order('criado_em', { ascending: false })
      if (data) setPedidos(data as Pedido[])
    }
    load()
  }, [])

  const filtrados = filtro === 'todos' ? pedidos : pedidos.filter(p => p.status === filtro)

  return (
    <>
      <header className="adm-header">
        <Link href="/" className="header-logo">NOVA <span>ROMA</span></Link>
        <span className="header-tag">Painel de Administração</span>
      </header>

      <main className="adm-main">
        <div className="top-bar">
          <h1 className="page-title">Pedidos</h1>
          <Link href="/adeeme" className="btn-ghost">← Produtos</Link>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          {['todos', 'pendente', 'aprovado', 'rejeitado', 'cancelado'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '8px 18px',
                fontFamily: "'Economica', sans-serif",
                fontWeight: 700,
                fontSize: '0.78rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: filtro === f ? 'var(--brown)' : 'rgba(107,63,31,0.25)',
                background: filtro === f ? 'var(--brown)' : 'transparent',
                color: filtro === f ? '#fff' : 'var(--text-muted)',
              }}
            >
              {f === 'todos' ? 'Todos' : STATUS_LABELS[f].label}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="empty">Nenhum pedido encontrado.</div>
        ) : (
          <table className="estoque-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Status</th>
                <th>Itens</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => {
                const st = STATUS_LABELS[p.status] ?? STATUS_LABELS.pendente
                return (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(p.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 3, fontSize: '0.78rem', fontWeight: 700, fontFamily: "'Jost', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: st.color, background: st.bg }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      {p.itens_pedido?.map(i => `${i.nome} (${i.tamanho}) ×${i.quantidade}`).join(', ')}
                    </td>
                    <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                      R$&nbsp;{Number(p.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </main>
    </>
  )
}
