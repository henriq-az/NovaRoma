'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Produto, EstoqueItem } from '@/lib/supabase'
import AdminHeader from '@/components/AdminHeader'
import '../../admin.css'

const TAMANHOS: EstoqueItem['tamanho'][] = ['PP', 'P', 'M', 'G', 'GG', 'XG']

export default function EstoquePage() {
  const { id } = useParams()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [estoque, setEstoque] = useState<EstoqueItem[]>([])
  const [entrada, setEntrada] = useState<Record<string, string>>({})
  const [saida, setSaida] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data: p } = await supabase.from('produtos').select('*').eq('id', id).single()
    const { data: e } = await supabase.from('estoque_itens').select('*').eq('produto_id', id)
    if (p) setProduto(p)
    setEstoque(e ?? [])
  }

  useEffect(() => { load() }, [id])

  function getQtd(tam: string) {
    return estoque.find(e => e.tamanho === tam)?.quantidade ?? 0
  }

  async function confirmar(tipo: 'entrada' | 'saida') {
    const vals = tipo === 'entrada' ? entrada : saida
    setSaving(true)
    for (const tam of TAMANHOS) {
      const qty = parseInt(vals[tam] || '0')
      if (!qty) continue
      const item = estoque.find(e => e.tamanho === tam)
      const novaQtd = tipo === 'entrada'
        ? (item?.quantidade ?? 0) + qty
        : Math.max(0, (item?.quantidade ?? 0) - qty)
      if (item) {
        await supabase.from('estoque_itens').update({ quantidade: novaQtd }).eq('id', item.id)
      } else if (tipo === 'entrada') {
        await supabase.from('estoque_itens').insert({ produto_id: Number(id), tamanho: tam, quantidade: novaQtd })
      }
    }
    tipo === 'entrada' ? setEntrada({}) : setSaida({})
    setSaving(false)
    load()
  }

  return (
    <>
      <AdminHeader />

      <main className="adm-main-narrow">
        <Link href="/adeeme" className="back">← Voltar aos Produtos</Link>

        <h1 className="page-title">Estoque</h1>
        {produto && <p className="page-sub">{produto.titulo}</p>}

        <table className="estoque-table">
          <thead>
            <tr>
              <th>Tamanho</th>
              <th>Quantidade em Estoque</th>
            </tr>
          </thead>
          <tbody>
            {TAMANHOS.map(tam => {
              const qtd = getQtd(tam)
              return (
                <tr key={tam}>
                  <td><strong>{tam}</strong></td>
                  <td>
                    <span className={`qty-badge ${qtd > 0 ? 'qty-ok' : 'qty-zero'}`}>{qtd}</span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Entrada */}
        <div className="mov-form">
          <p className="section-title-mov section-entrada">+ Adicionar ao Estoque (Chegada)</p>
          <div className="mov-grid">
            {TAMANHOS.map(tam => (
              <div className="mov-field" key={tam}>
                <label>{tam}</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={entrada[tam] ?? ''}
                  onChange={e => setEntrada(prev => ({ ...prev, [tam]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-entrada" onClick={() => confirmar('entrada')} disabled={saving}>
            Confirmar Entrada
          </button>
        </div>

        {/* Saída */}
        <div className="mov-form">
          <p className="section-title-mov section-saida">− Descontar do Estoque (Venda Fora do Site)</p>
          <div className="mov-grid">
            {TAMANHOS.map(tam => (
              <div className="mov-field" key={tam}>
                <label>{tam}</label>
                <input
                  type="number"
                  min="1"
                  placeholder="0"
                  value={saida[tam] ?? ''}
                  onChange={e => setSaida(prev => ({ ...prev, [tam]: e.target.value }))}
                />
              </div>
            ))}
          </div>
          <button className="btn btn-saida" onClick={() => confirmar('saida')} disabled={saving}>
            Confirmar Saída
          </button>
        </div>
      </main>
    </>
  )
}
