'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import '../admin.css'
import PedidoModal, { type PedidoDetalhe } from './PedidoModal'

// ── Types ─────────────────────────────────────────────────────────────
type ItemPedido    = { nome: string; tamanho: string; quantidade: number; preco: number; produto_id: number }
type HistoricoItem = { id: number; status_anterior: string | null; status_novo: string; criado_em: string }
type Pedido = {
  id: string
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'entregue'
  total: number
  criado_em: string
  nome_cliente?: string | null
  email_cliente?: string | null
  telefone_cliente?: string | null
  endereco?: Record<string, string> | string | null
  itens_pedido: ItemPedido[]
  historico_pedido?: HistoricoItem[]
}
type Periodo    = 'hoje' | 'semana' | 'mes'
type SortField  = 'criado_em' | 'total' | 'status'
type ChartPoint = { label: string; value: number; key: string }
type SortDir   = 'asc' | 'desc'
type Aba       = 'pendentes' | 'concluidos' | 'todos'

// ── Status config ──────────────────────────────────────────────────────
const ST: Record<string, { label: string; color: string; bg: string }> = {
  pendente:  { label: 'Pagamento Pendente', color: '#8a6200', bg: '#fff8e1' },
  aprovado:  { label: 'Entrega Pendente',   color: '#b85c00', bg: '#fff3e0' },
  rejeitado: { label: 'Pagamento Recusado', color: '#CC0000', bg: '#fdecea' },
  cancelado: { label: 'Cancelado',          color: '#666',    bg: '#f5f5f5' },
  entregue:  { label: 'Entregue',           color: '#1a4a8a', bg: '#e8f0fd' },
}

// ── Date / metric helpers ──────────────────────────────────────────────
function cutoff(p: Periodo): Date {
  const now = new Date()
  if (p === 'hoje')   { const d = new Date(now); d.setHours(0, 0, 0, 0); return d }
  if (p === 'semana') { const d = new Date(now); d.setDate(d.getDate() - 7); return d }
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

// Returns true if the pedido has at least one item matching the active filters
function itemMatch(p: Pedido, produto: string, tamanho: string): boolean {
  if (!produto && !tamanho) return true
  return p.itens_pedido?.some(i =>
    (!produto  || i.nome    === produto) &&
    (!tamanho  || i.tamanho === tamanho)
  ) ?? false
}

// Revenue contribution of matching items only (or full total if no filter)
function pedidoValue(p: Pedido, produto: string, tamanho: string): number {
  if (!produto && !tamanho) return Number(p.total)
  return (p.itens_pedido ?? [])
    .filter(i => (!produto || i.nome === produto) && (!tamanho || i.tamanho === tamanho))
    .reduce((s, i) => s + Number(i.preco) * i.quantidade, 0)
}

function calcMetrics(pedidos: Pedido[], periodo: Periodo, produto = '', tamanho = '') {
  const from      = cutoff(periodo)
  const slice     = pedidos.filter(p => new Date(p.criado_em) >= from && itemMatch(p, produto, tamanho))
  const confirmed = slice.filter(p => p.status === 'aprovado' || p.status === 'entregue')
  const fat       = confirmed.reduce((s, p) => s + pedidoValue(p, produto, tamanho), 0)
  return {
    faturamento:  fat,
    totalPedidos: slice.length,
    ticket:       confirmed.length > 0 ? fat / confirmed.length : 0,
    entregues:    slice.filter(p => p.status === 'entregue').length,
  }
}

function applySorting(list: Pedido[], field: SortField, dir: SortDir) {
  return [...list].sort((a, b) => {
    const av = field === 'criado_em' ? new Date(a.criado_em).getTime()
             : field === 'total'     ? Number(a.total)
             : a.status
    const bv = field === 'criado_em' ? new Date(b.criado_em).getTime()
             : field === 'total'     ? Number(b.total)
             : b.status
    if (av < bv) return dir === 'asc' ? -1 : 1
    if (av > bv) return dir === 'asc' ? 1  : -1
    return 0
  })
}

function fmtBRL(v: number) {
  return `R$ ${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
}
function fmtAxis(v: number): string {
  if (v === 0) return '0'
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace('.', ',')}k`
  return String(Math.round(v))
}
function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 60)  return `${mins}min atrás`
  if (mins < 1440) return `${Math.floor(mins / 60)}h atrás`
  return `${Math.floor(mins / 1440)}d atrás`
}

// ── Search & Export ───────────────────────────────────────────────────
function applySearch(list: Pedido[], q: string): Pedido[] {
  if (!q.trim()) return list
  const lq = q.toLowerCase()
  return list.filter(p =>
    p.nome_cliente?.toLowerCase().includes(lq) ||
    p.email_cliente?.toLowerCase().includes(lq) ||
    p.itens_pedido?.some(i => i.nome.toLowerCase().includes(lq))
  )
}

function exportCSV(pedidos: Pedido[]) {
  const headers = ['Data', 'Status', 'Cliente', 'E-mail', 'Itens', 'Total (R$)']
  const rows = pedidos.map(p => [
    fmtDate(p.criado_em),
    ST[p.status]?.label ?? p.status,
    p.nome_cliente ?? '',
    p.email_cliente ?? '',
    p.itens_pedido?.map(i => `${i.nome} (${i.tamanho}) x${i.quantidade}`).join('; ') ?? '',
    Number(p.total).toFixed(2).replace('.', ','),
  ])
  const csv  = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: `pedidos_${new Date().toISOString().slice(0, 10)}.csv` })
  document.body.appendChild(a); a.click(); document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Chart data builder ────────────────────────────────────────────────
function buildChartData(pedidos: Pedido[], periodo: Periodo, produto = '', tamanho = ''): ChartPoint[] {
  const now       = new Date()
  const confirmed = pedidos.filter(p =>
    (p.status === 'aprovado' || p.status === 'entregue') && itemMatch(p, produto, tamanho)
  )

  if (periodo === 'hoje') {
    const hours: ChartPoint[] = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}h`, key: String(i), value: 0,
    }))
    confirmed.forEach(p => {
      const d = new Date(p.criado_em)
      if (d.toDateString() === now.toDateString())
        hours[d.getHours()].value += pedidoValue(p, produto, tamanho)
    })
    return hours
  }

  if (periodo === 'semana') {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      return { label: d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), key: d.toDateString(), value: 0 }
    })
    confirmed.forEach(p => {
      const pt = days.find(d => d.key === new Date(p.criado_em).toDateString())
      if (pt) pt.value += pedidoValue(p, produto, tamanho)
    })
    return days
  }

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const days: ChartPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({
    label: String(i + 1), key: String(i + 1), value: 0,
  }))
  confirmed.forEach(p => {
    const d = new Date(p.criado_em)
    if (d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth())
      days[d.getDate() - 1].value += pedidoValue(p, produto, tamanho)
  })
  return days
}

// ── Bar Chart SVG ──────────────────────────────────────────────────────
function BarChart({ data, periodo }: { data: ChartPoint[]; periodo: Periodo }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const PL = 52, PR = 10, PT = 8, PB = 28
  const VW = 600, VH = 190
  const cW = VW - PL - PR
  const cH = VH - PT - PB
  const n  = data.length

  const maxVal = Math.max(...data.map(d => d.value), 1)
  const gap    = n > 20 ? 2 : n > 10 ? 3 : 6
  const barW   = (cW - gap * (n - 1)) / n

  function showLabel(i: number) {
    if (periodo === 'hoje')   return i % 6 === 0
    if (periodo === 'semana') return true
    return i === 0 || (i + 1) % 5 === 0 || i === n - 1
  }

  const yTicks = [0, 0.25, 0.5, 0.75, 1]

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(107,63,31,0.12)', padding: '1.4rem 1.8rem', position: 'relative', gridColumn: '1 / -1' }}>
      <p style={{ fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 12 }}>
        Faturamento por {periodo === 'hoje' ? 'hora' : periodo === 'semana' ? 'dia' : 'dia do mês'}
      </p>

      {hovered !== null && data[hovered] && (
        <div style={{ position: 'absolute', top: 16, right: 20, background: 'var(--brown-dark)', color: '#fff', padding: '5px 14px', borderRadius: 3, fontSize: '0.8rem', fontFamily: "'Jost', sans-serif", fontWeight: 700, pointerEvents: 'none' }}>
          {data[hovered].label} — {fmtBRL(data[hovered].value)}
        </div>
      )}

      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: '100%', display: 'block' }}>
        {/* Y gridlines + labels */}
        {yTicks.map(pct => {
          const y = PT + cH - pct * cH
          return (
            <g key={pct}>
              <line x1={PL} y1={y} x2={VW - PR} y2={y} stroke="rgba(107,63,31,0.08)" strokeWidth={1} />
              <text x={PL - 5} y={y + 3.5} textAnchor="end" fontSize={9} fill="#9a8878" fontFamily="Economica, sans-serif">
                {fmtAxis(maxVal * pct)}
              </text>
            </g>
          )
        })}

        {/* Y-axis line */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="rgba(107,63,31,0.18)" strokeWidth={1} />

        {/* Bars */}
        {data.map((d, i) => {
          const barH  = Math.max((d.value / maxVal) * cH, d.value > 0 ? 2 : 0)
          const x     = PL + i * (barW + gap)
          const y     = PT + cH - barH
          const isHov = hovered === i
          return (
            <g key={d.key}>
              <rect
                x={x} y={barH > 0 ? y : PT + cH - 1}
                width={barW} height={barH > 0 ? barH : 1}
                fill={d.value > 0 ? (isHov ? '#3D2010' : '#6B3F1F') : 'rgba(107,63,31,0.08)'}
                rx={1.5}
                style={{ cursor: 'pointer', transition: 'fill 0.12s' }}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {showLabel(i) && (
                <text x={x + barW / 2} y={PT + cH + 18} textAnchor="middle" fontSize={9} fill="#9a8878" fontFamily="Economica, sans-serif">
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const s = ST[status] ?? ST.pendente
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 3,
      fontSize: '0.7rem', fontWeight: 700, fontFamily: "'Jost', sans-serif",
      letterSpacing: '0.1em', textTransform: 'uppercase', color: s.color, background: s.bg,
    }}>
      {s.label}
    </span>
  )
}

function SortTh({ field, label, sort, onSort }: {
  field: SortField; label: string
  sort: { field: SortField; dir: SortDir }
  onSort: (f: SortField) => void
}) {
  const active = sort.field === field
  return (
    <th onClick={() => onSort(field)} style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
      {label}&nbsp;
      <span style={{ opacity: active ? 1 : 0.3, fontSize: '0.75em' }}>
        {active ? (sort.dir === 'asc' ? '↑' : '↓') : '↕'}
      </span>
    </th>
  )
}

function HistoricoTimeline({ items }: { items?: HistoricoItem[] }) {
  if (!items || items.length === 0)
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Nenhum histórico registrado.</p>

  const ordered = [...items].sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())
  return (
    <div>
      <p style={{ fontSize: '0.6rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--brown)', fontWeight: 700, marginBottom: 10 }}>
        Histórico de Status
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {ordered.map(h => (
          <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 115 }}>{fmtDate(h.criado_em)}</span>
            {h.status_anterior && (
              <><Badge status={h.status_anterior} /><span style={{ color: 'var(--text-muted)' }}>→</span></>
            )}
            <Badge status={h.status_novo} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(107,63,31,0.12)', padding: '1.4rem 1.8rem' }}>
      <p style={{ fontSize: '0.57rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 8 }}>
        {label}
      </p>
      <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 900, fontSize: '1.7rem', color: 'var(--brown-dark)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 5 }}>{sub}</p>}
    </div>
  )
}

// ── Tabela reutilizável com sort + histórico expansível ────────────────
function TabelaPedidos({
  pedidos, showStatus = true, onMarcarEntregue, carregando, onRowClick,
}: {
  pedidos: Pedido[]
  showStatus?: boolean
  onMarcarEntregue?: (id: string) => void
  carregando?: string | null
  onRowClick?: (p: Pedido) => void
}) {
  const [sort, setSort]       = useState<{ field: SortField; dir: SortDir }>({ field: 'criado_em', dir: 'desc' })
  const [expanded, setExpanded] = useState<string | null>(null)

  function toggleSort(field: SortField) {
    setSort(s => ({ field, dir: s.field === field && s.dir === 'desc' ? 'asc' : 'desc' }))
  }

  const rows     = applySorting(pedidos, sort.field, sort.dir)
  const colCount = 4 + (showStatus ? 1 : 0) + (onMarcarEntregue ? 1 : 0)

  if (rows.length === 0) return <div className="empty">Nenhum pedido encontrado.</div>

  return (
    <table className="estoque-table">
      <thead>
        <tr>
          <SortTh field="criado_em" label="Data"  sort={sort} onSort={toggleSort} />
          {showStatus && <SortTh field="status" label="Status" sort={sort} onSort={toggleSort} />}
          <th>Itens</th>
          <SortTh field="total" label="Total" sort={sort} onSort={toggleSort} />
          <th>Histórico</th>
          {onMarcarEntregue && <th></th>}
        </tr>
      </thead>
      <tbody>
        {rows.map(p => (
          <Fragment key={p.id}>
            <tr
              onClick={() => onRowClick?.(p)}
              style={{ cursor: onRowClick ? 'pointer' : undefined }}
            >
              <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(p.criado_em)}</td>
              {showStatus && <td><Badge status={p.status} /></td>}
              <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {p.itens_pedido?.map(i => `${i.nome} (${i.tamanho}) ×${i.quantidade}`).join(', ')}
              </td>
              <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{fmtBRL(p.total)}</td>
              <td>
                <button
                  onClick={e => { e.stopPropagation(); setExpanded(ev => ev === p.id ? null : p.id) }}
                  style={{ background: 'transparent', border: '1px solid rgba(107,63,31,0.25)', padding: '4px 12px', fontFamily: "'Economica', sans-serif", fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  {expanded === p.id ? 'Fechar' : 'Ver'}
                </button>
              </td>
              {onMarcarEntregue && (
                <td>
                  <button
                    className="btn"
                    style={{ background: '#1a6e3c', padding: '7px 14px', fontSize: '0.72rem', opacity: carregando === p.id ? 0.6 : 1 }}
                    onClick={e => { e.stopPropagation(); onMarcarEntregue(p.id) }}
                    disabled={carregando === p.id}
                  >
                    {carregando === p.id ? '...' : 'Confirmar Entrega'}
                  </button>
                </td>
              )}
            </tr>
            {expanded === p.id && (
              <tr>
                <td colSpan={colCount} style={{ background: '#f9f6f2', padding: '1.1rem 1.6rem', borderBottom: '2px solid rgba(107,63,31,0.1)' }}>
                  <HistoricoTimeline items={p.historico_pedido} />
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}

// ── Page ──────────────────────────────────────────────────────────────
const PERIODO_LABEL: Record<Periodo, string> = { hoje: 'Hoje', semana: 'Última Semana', mes: 'Este Mês' }

export default function PedidosPage() {
  const [pedidos, setPedidos]       = useState<Pedido[]>([])
  const [aba, setAba]               = useState<Aba>('pendentes')
  const [periodo, setPeriodo]       = useState<Periodo>('mes')
  const [filtroTodos, setFiltroTodos] = useState('todos')
  const [carregando, setCarregando]       = useState<string | null>(null)
  const [novos, setNovos]                 = useState(0)
  const [ultimoAcesso, setUltimoAcesso]   = useState<string | null>(null)
  const [busca, setBusca]                   = useState('')
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null)
  const [filtroProduto, setFiltroProduto]   = useState('')
  const [filtroTamanho, setFiltroTamanho]   = useState('')

  useEffect(() => {
    const last = localStorage.getItem('novaroma_last_access')
    setUltimoAcesso(last)
    localStorage.setItem('novaroma_last_access', new Date().toISOString())
  }, [])

  const load = useCallback(async () => {
    let { data, error } = await supabase
      .from('pedidos')
      .select('*, itens_pedido(*), historico_pedido(*)')
      .order('criado_em', { ascending: false })

    if (error) {
      const fb = await supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .order('criado_em', { ascending: false })
      data = fb.data
    }

    if (data) setPedidos(data as Pedido[])
  }, [])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    if (!ultimoAcesso || pedidos.length === 0) return
    setNovos(pedidos.filter(p => new Date(p.criado_em) > new Date(ultimoAcesso)).length)
  }, [pedidos, ultimoAcesso])

  async function marcarEntregue(id: string) {
    setCarregando(id)
    await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'entregue' }),
    })
    await load()
    setCarregando(null)
  }

  const pendentes  = applySearch(pedidos.filter(p => p.status === 'aprovado'), busca)
  const concluidos = applySearch(pedidos.filter(p => p.status === 'entregue'), busca)
  const filtrados  = applySearch(filtroTodos === 'todos' ? pedidos : pedidos.filter(p => p.status === filtroTodos), busca)
  const produtosDisponiveis = Array.from(new Set(
    pedidos.flatMap(p => p.itens_pedido?.map(i => i.nome) ?? [])
  )).sort()

  const m         = calcMetrics(pedidos, periodo, filtroProduto, filtroTamanho)
  const chartData = buildChartData(pedidos, periodo, filtroProduto, filtroTamanho)

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/pedidos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
    setSelectedPedido(prev => prev?.id === id ? { ...prev, status: status as Pedido['status'] } : prev)
  }

  function TabBtn({ t, label, count }: { t: Aba; label: string; count?: number }) {
    const active = aba === t
    return (
      <button
        onClick={() => setAba(t)}
        style={{ padding: '10px 22px', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', borderColor: active ? 'var(--brown)' : 'rgba(107,63,31,0.25)', background: active ? 'var(--brown)' : 'transparent', color: active ? '#fff' : 'var(--text-muted)' }}
      >
        {label}
        {count != null && count > 0 && (
          <span style={{ marginLeft: 8, background: active ? 'rgba(255,255,255,0.25)' : 'var(--brown)', color: '#fff', borderRadius: 99, padding: '1px 7px', fontSize: '0.65rem' }}>
            {count}
          </span>
        )}
      </button>
    )
  }

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

        {/* ── DASHBOARD ── */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {(['hoje', 'semana', 'mes'] as Periodo[]).map(p => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                style={{ padding: '7px 16px', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', borderColor: periodo === p ? 'var(--brown-dark)' : 'rgba(107,63,31,0.2)', background: periodo === p ? 'var(--brown-dark)' : 'transparent', color: periodo === p ? '#fff' : 'var(--text-muted)' }}
              >
                {PERIODO_LABEL[p]}
              </button>
            ))}
          </div>

          {/* ── Filtros por produto / tamanho ── */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              value={filtroProduto}
              onChange={e => setFiltroProduto(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid rgba(107,63,31,0.25)', background: '#fff', fontFamily: "'Economica', sans-serif", fontSize: '0.9rem', color: filtroProduto ? 'var(--text-dark)' : 'var(--text-muted)', outline: 'none', minWidth: 180 }}
            >
              <option value="">Todos os produtos</option>
              {produtosDisponiveis.map(nome => (
                <option key={nome} value={nome}>{nome}</option>
              ))}
            </select>

            <select
              value={filtroTamanho}
              onChange={e => setFiltroTamanho(e.target.value)}
              style={{ padding: '7px 12px', border: '1px solid rgba(107,63,31,0.25)', background: '#fff', fontFamily: "'Economica', sans-serif", fontSize: '0.9rem', color: filtroTamanho ? 'var(--text-dark)' : 'var(--text-muted)', outline: 'none' }}
            >
              <option value="">Todos os tamanhos</option>
              {['PP', 'P', 'M', 'G', 'GG', 'XG'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {(filtroProduto || filtroTamanho) && (
              <button
                onClick={() => { setFiltroProduto(''); setFiltroTamanho('') }}
                style={{ padding: '7px 14px', background: 'transparent', border: '1px solid rgba(107,63,31,0.2)', fontFamily: "'Economica', sans-serif", fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                × Limpar
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            <MetricCard label="Faturamento"      value={fmtBRL(m.faturamento)}                   sub={PERIODO_LABEL[periodo]} />
            <MetricCard label="Total de Pedidos" value={String(m.totalPedidos)}                  sub={PERIODO_LABEL[periodo]} />
            <MetricCard label="Ticket Médio"     value={m.ticket > 0 ? fmtBRL(m.ticket) : '—'} sub="pedidos confirmados" />
            <MetricCard label="Entregues"        value={String(m.entregues)}                     sub={PERIODO_LABEL[periodo]} />
            <BarChart data={chartData} periodo={periodo} />
          </div>
        </div>

        {/* ── NOVOS PEDIDOS ── */}
        {novos > 0 && (
          <div style={{ background: '#e6f4ec', border: '1px solid #1a6e3c', padding: '12px 20px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#1a6e3c' }}>
              {novos} {novos === 1 ? 'novo pedido' : 'novos pedidos'} desde o último acesso
            </span>
            {ultimoAcesso && (
              <span style={{ fontSize: '0.75rem', color: '#2d7a4a' }}>({timeAgo(ultimoAcesso)})</span>
            )}
          </div>
        )}

        {/* ── BUSCA + EXPORT ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Buscar por cliente ou produto..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ flex: 1, minWidth: 220, padding: '10px 14px', border: '1px solid rgba(107,63,31,0.25)', background: '#fff', fontFamily: "'Economica', sans-serif", fontSize: '0.95rem', color: 'var(--text-dark)', outline: 'none' }}
          />
          <button
            onClick={() => exportCSV(filtroTodos === 'todos' ? pedidos : filtrados)}
            className="btn-ghost"
            style={{ whiteSpace: 'nowrap' }}
          >
            ↓ Exportar CSV
          </button>
        </div>

        {/* ── ABAS ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: '2rem', flexWrap: 'wrap' }}>
          <TabBtn t="pendentes"  label="Entregas Pendentes" count={pendentes.length} />
          <TabBtn t="concluidos" label="Concluídos"         count={concluidos.length} />
          <TabBtn t="todos"      label="Todos os Pedidos" />
        </div>

        {/* ── CONTEÚDO POR ABA ── */}
        {aba === 'pendentes' && (
          <>
            <p className="page-sub">Pagamento confirmado — aguardando envio ou entrega.</p>
            <TabelaPedidos
              pedidos={pendentes}
              showStatus={false}
              onMarcarEntregue={marcarEntregue}
              carregando={carregando}
              onRowClick={setSelectedPedido}
            />
          </>
        )}

        {aba === 'concluidos' && (
          <>
            <p className="page-sub">Histórico de pedidos entregues.</p>
            <TabelaPedidos pedidos={concluidos} showStatus={false} onRowClick={setSelectedPedido} />
          </>
        )}

        {aba === 'todos' && (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {['todos', 'pendente', 'aprovado', 'entregue', 'rejeitado', 'cancelado'].map(f => (
                <button
                  key={f}
                  onClick={() => setFiltroTodos(f)}
                  style={{ padding: '7px 14px', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', border: '1px solid', borderColor: filtroTodos === f ? 'var(--brown)' : 'rgba(107,63,31,0.2)', background: filtroTodos === f ? 'var(--brown)' : 'transparent', color: filtroTodos === f ? '#fff' : 'var(--text-muted)' }}
                >
                  {f === 'todos' ? 'Todos' : (ST[f]?.label ?? f)}
                </button>
              ))}
            </div>
            <TabelaPedidos pedidos={filtrados} onRowClick={setSelectedPedido} />
          </>
        )}
      </main>

      {selectedPedido && (
        <PedidoModal
          pedido={selectedPedido as PedidoDetalhe}
          onClose={() => setSelectedPedido(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  )
}
