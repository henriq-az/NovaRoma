'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

export type PedidoDetalhe = {
  id: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'entregue'
  total: number
  criado_em: string
  nome_cliente?: string | null
  email_cliente?: string | null
  telefone_cliente?: string | null
  endereco?: Record<string, string> | string | null
  itens_pedido: { nome: string; tamanho: string; quantidade: number; preco: number; produto_id: number }[]
  historico_pedido?: { id: number; status_anterior: string | null; status_novo: string; criado_em: string }[]
}

const ST: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: 'Pagamento Pendente', color: '#8a6200', bg: '#fff8e1' },
  aprovado:  { label: 'Entrega Pendente',   color: '#b85c00', bg: '#fff3e0' },
  rejeitado: { label: 'Pagamento Recusado', color: '#CC0000', bg: '#fdecea' },
  cancelado: { label: 'Cancelado',          color: '#666',    bg: '#f5f5f5' },
  entregue:  { label: 'Entregue',           color: '#1a4a8a', bg: '#e8f0fd' },
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}

function Badge({ status }: { status: string }) {
  const s = ST[status] ?? ST.pendente
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Jost', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase', color: s.color, background: s.bg }}>
      {s.label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9a8878', fontWeight: 700, marginBottom: 10, marginTop: 24 }}>
      {children}
    </p>
  )
}

type Props = {
  pedido: PedidoDetalhe
  onClose: () => void
  onStatusChange: (id: string, status: string) => Promise<void>
}

export default function PedidoModal({ pedido, onClose, onStatusChange }: Props) {
  const [fotos, setFotos] = useState<Record<number, string>>({})
  const [novoStatus, setNovoStatus] = useState(pedido.status)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNovoStatus(pedido.status)
    const ids = [...new Set(pedido.itens_pedido.map(i => i.produto_id))]
    if (ids.length === 0) return
    supabase
      .from('fotos_produto')
      .select('produto_id, url')
      .in('produto_id', ids)
      .order('ordem')
      .then(({ data }) => {
        const map: Record<number, string> = {}
        data?.forEach(f => { if (!map[f.produto_id]) map[f.produto_id] = f.url })
        setFotos(map)
      })
  }, [pedido.id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  async function salvarStatus() {
    setSaving(true)
    await onStatusChange(pedido.id, novoStatus)
    setSaving(false)
  }

  const addr = pedido.endereco
    ? typeof pedido.endereco === 'string'
      ? { raw: pedido.endereco }
      : pedido.endereco
    : null

  const historico = pedido.historico_pedido
    ? [...pedido.historico_pedido].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
    : []

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: 520,
        background: '#faf6f1', zIndex: 201, overflowY: 'auto', padding: '28px 28px 48px',
        boxShadow: '-8px 0 32px rgba(0,0,0,0.18)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div>
            <p style={{ fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#9a8878', fontWeight: 700, marginBottom: 4 }}>
              Pedido #{pedido.id.slice(0, 8).toUpperCase()}
            </p>
            <Badge status={pedido.status} />
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#9a8878', lineHeight: 1, padding: 4 }}
          >
            ✕
          </button>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#9a8878', marginTop: 6 }}>{fmtDate(pedido.criado_em)}</p>

        {/* Customer */}
        <SectionLabel>Cliente</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {pedido.nome_cliente && <p style={{ fontWeight: 700, color: '#3d2010' }}>{pedido.nome_cliente}</p>}
          {pedido.email_cliente && <p style={{ fontSize: '0.85rem', color: '#666' }}>{pedido.email_cliente}</p>}
          {pedido.telefone_cliente && <p style={{ fontSize: '0.85rem', color: '#666' }}>{pedido.telefone_cliente}</p>}
          {!pedido.nome_cliente && !pedido.email_cliente && (
            <p style={{ fontSize: '0.85rem', color: '#9a8878', fontStyle: 'italic' }}>Dados não disponíveis</p>
          )}
        </div>

        {/* Address */}
        {addr && (
          <>
            <SectionLabel>Endereço de Entrega</SectionLabel>
            {'raw' in addr ? (
              <p style={{ fontSize: '0.85rem', color: '#555' }}>{addr.raw}</p>
            ) : (
              <p style={{ fontSize: '0.85rem', color: '#555', lineHeight: 1.6 }}>
                {[addr.street_name, addr.street_number].filter(Boolean).join(', ')}
                {addr.neighborhood && <><br />{addr.neighborhood}</>}
                {(addr.city || addr.state) && <><br />{[addr.city, addr.state].filter(Boolean).join(' — ')}</>}
                {addr.zip_code && <><br />CEP {addr.zip_code}</>}
              </p>
            )}
          </>
        )}

        {/* Items */}
        <SectionLabel>Itens</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {pedido.itens_pedido.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fff', padding: '10px 12px', border: '1px solid rgba(107,63,31,0.1)' }}>
              {fotos[item.produto_id] ? (
                <div style={{ position: 'relative', width: 52, height: 62, flexShrink: 0 }}>
                  <Image src={fotos[item.produto_id]} alt={item.nome} fill style={{ objectFit: 'cover' }} />
                </div>
              ) : (
                <div style={{ width: 52, height: 62, background: '#e8d9c4', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: '#3d2010', fontSize: '0.9rem', marginBottom: 2 }}>{item.nome}</p>
                <p style={{ fontSize: '0.8rem', color: '#9a8878' }}>Tam: {item.tamanho} · Qtd: {item.quantidade}</p>
              </div>
              <p style={{ fontWeight: 700, color: '#3d2010', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
                R$ {(Number(item.preco) * item.quantidade).toFixed(2).replace('.', ',')}
              </p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 700, fontSize: '1rem', color: '#3d2010' }}>
          Total: R$ {Number(pedido.total).toFixed(2).replace('.', ',')}
        </div>

        {/* Status change */}
        <SectionLabel>Alterar Status</SectionLabel>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={novoStatus}
            onChange={e => setNovoStatus(e.target.value as PedidoDetalhe['status'])}
            style={{ flex: 1, padding: '9px 12px', border: '1px solid rgba(107,63,31,0.25)', background: '#fff', fontFamily: "'Economica', sans-serif", fontSize: '0.9rem', color: '#3d2010', outline: 'none' }}
          >
            {Object.entries(ST).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <button
            onClick={salvarStatus}
            disabled={saving || novoStatus === pedido.status}
            style={{ padding: '9px 20px', background: novoStatus !== pedido.status ? '#3d2010' : 'rgba(107,63,31,0.2)', color: '#fff', border: 'none', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: novoStatus !== pedido.status ? 'pointer' : 'not-allowed', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? '...' : 'Salvar'}
          </button>
        </div>

        {/* History */}
        {historico.length > 0 && (
          <>
            <SectionLabel>Histórico de Status</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {historico.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9a8878', minWidth: 115 }}>{fmtDate(h.criado_em)}</span>
                  {h.status_anterior && (
                    <><Badge status={h.status_anterior} /><span style={{ color: '#9a8878' }}>→</span></>
                  )}
                  <Badge status={h.status_novo} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
