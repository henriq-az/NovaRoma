'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import AdminHeader from '@/components/AdminHeader'
import '../admin.css'

type Cupom = {
  id: number
  codigo: string
  tipo: 'percentual' | 'fixo'
  valor: number
  uso_maximo: number | null
  usos_atuais: number
  valido_ate: string | null
  ativo: boolean
  criado_em: string
}

function fmtData(d: string) {
  return new Date(d).toLocaleDateString('pt-BR')
}

function BadgeStatus({ ativo }: { ativo: boolean }) {
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 3,
      fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      color: ativo ? '#1a4a8a' : '#666',
      background: ativo ? '#e8f0fd' : '#f5f5f5',
    }}>
      {ativo ? 'Ativo' : 'Inativo'}
    </span>
  )
}

export default function CuponsPage() {
  const [cupons, setCupons]     = useState<Cupom[]>([])
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving]     = useState(false)

  const [codigo, setCodigo]         = useState('')
  const [tipo, setTipo]             = useState<'percentual' | 'fixo'>('percentual')
  const [valor, setValor]           = useState('')
  const [usoMaximo, setUsoMaximo]   = useState('')
  const [validoAte, setValidoAte]   = useState('')

  async function load() {
    const { data } = await supabase.from('cupons').select('*').order('criado_em', { ascending: false })
    if (data) setCupons(data as Cupom[])
  }

  useEffect(() => { load() }, [])

  function resetForm() {
    setCodigo(''); setTipo('percentual'); setValor(''); setUsoMaximo(''); setValidoAte('')
  }

  async function salvar() {
    if (!codigo.trim() || !valor) return
    setSaving(true)
    await supabase.from('cupons').insert({
      codigo:      codigo.toUpperCase().trim(),
      tipo,
      valor:       Number(valor),
      uso_maximo:  usoMaximo ? Number(usoMaximo) : null,
      valido_ate:  validoAte || null,
      ativo:       true,
    })
    resetForm()
    setShowForm(false)
    await load()
    setSaving(false)
  }

  async function toggleAtivo(id: number, ativo: boolean) {
    await supabase.from('cupons').update({ ativo: !ativo }).eq('id', id)
    load()
  }

  async function deletar(id: number, codigo: string) {
    if (!confirm(`Deletar cupom "${codigo}"?`)) return
    await supabase.from('cupons').delete().eq('id', id)
    load()
  }

  return (
    <>
      <AdminHeader />

      <main className="adm-main">
        <div className="top-bar">
          <h1 className="page-title">Cupons</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/adeeme/pedidos" className="btn-ghost">Pedidos</Link>
            <Link href="/adeeme" className="btn-ghost">Produtos</Link>
            <button className="btn" onClick={() => { resetForm(); setShowForm(v => !v) }}>
              {showForm ? '✕ Cancelar' : '+ Novo Cupom'}
            </button>
          </div>
        </div>

        {/* Formulário de criação */}
        {showForm && (
          <div className="form-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="adm-label">Código</label>
                <input
                  className="adm-input"
                  placeholder="EX: PROMO10"
                  value={codigo}
                  onChange={e => setCodigo(e.target.value.toUpperCase())}
                  style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="adm-label">Tipo</label>
                <select
                  className="adm-input"
                  value={tipo}
                  onChange={e => setTipo(e.target.value as 'percentual' | 'fixo')}
                >
                  <option value="percentual">Percentual (%)</option>
                  <option value="fixo">Valor fixo (R$)</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="adm-label">{tipo === 'percentual' ? 'Desconto (%)' : 'Desconto (R$)'}</label>
                <input
                  className="adm-input"
                  type="number"
                  placeholder={tipo === 'percentual' ? '10' : '30.00'}
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  min="0"
                  step={tipo === 'percentual' ? '1' : '0.01'}
                  max={tipo === 'percentual' ? '100' : undefined}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="adm-label">Uso máximo <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                <input
                  className="adm-input"
                  type="number"
                  placeholder="Ilimitado"
                  value={usoMaximo}
                  onChange={e => setUsoMaximo(e.target.value)}
                  min="1"
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="adm-label">Válido até <span style={{ opacity: 0.5 }}>(opcional)</span></label>
                <input
                  className="adm-input"
                  type="date"
                  value={validoAte}
                  onChange={e => setValidoAte(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-lg"
                onClick={salvar}
                disabled={saving || !codigo.trim() || !valor}
              >
                {saving ? 'Salvando...' : 'Criar Cupom'}
              </button>
            </div>
          </div>
        )}

        {/* Tabela */}
        {cupons.length === 0 ? (
          <div className="empty">Nenhum cupom cadastrado.</div>
        ) : (
          <table className="estoque-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Desconto</th>
                <th>Usos</th>
                <th>Validade</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cupons.map(c => {
                const expirado = c.valido_ate ? new Date(c.valido_ate) < new Date() : false
                const esgotado = c.uso_maximo !== null && c.usos_atuais >= c.uso_maximo
                return (
                  <tr key={c.id} style={{ opacity: (!c.ativo || expirado || esgotado) ? 0.55 : 1 }}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.95rem', color: 'var(--brown-dark)' }}>
                        {c.codigo}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {c.tipo === 'percentual'
                        ? `${c.valor}%`
                        : `R$ ${Number(c.valor).toFixed(2).replace('.', ',')}`}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {c.usos_atuais}
                      {c.uso_maximo !== null ? ` / ${c.uso_maximo}` : ' / ∞'}
                    </td>
                    <td style={{ color: expirado ? '#CC0000' : 'var(--text-muted)', fontSize: '0.88rem' }}>
                      {c.valido_ate ? fmtData(c.valido_ate) : '—'}
                      {expirado && <span style={{ marginLeft: 6, fontSize: '0.7rem', color: '#CC0000' }}>Expirado</span>}
                    </td>
                    <td>
                      <BadgeStatus ativo={c.ativo && !expirado && !esgotado} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn-edit"
                          onClick={() => toggleAtivo(c.id, c.ativo)}
                        >
                          {c.ativo ? 'Pausar' : 'Ativar'}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => deletar(c.id, c.codigo)}
                        >
                          Deletar
                        </button>
                      </div>
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
