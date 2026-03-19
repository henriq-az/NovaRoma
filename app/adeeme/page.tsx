'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase, Produto, FotoProduto } from '@/lib/supabase'
import './admin.css'

type ProdutoComFoto = Produto & { foto?: string }

export default function AdeemePage() {
  const [produtos, setProdutos] = useState<ProdutoComFoto[]>([])

  async function load() {
    const { data: prods } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false })
    if (!prods) return
    const { data: fotos } = await supabase.from('fotos_produto').select('*').order('ordem')
    const fotoMap: Record<number, string> = {}
    fotos?.forEach((f: FotoProduto) => {
      if (!fotoMap[f.produto_id]) fotoMap[f.produto_id] = f.url
    })
    setProdutos(prods.map((p: Produto) => ({ ...p, foto: fotoMap[p.id] })))
  }

  useEffect(() => { load() }, [])

  async function deletar(id: number, titulo: string) {
    if (!confirm(`Deletar ${titulo}?`)) return
    await supabase.from('fotos_produto').delete().eq('produto_id', id)
    await supabase.from('estoque_itens').delete().eq('produto_id', id)
    await supabase.from('produtos').delete().eq('id', id)
    load()
  }

  return (
    <>
      <header className="adm-header">
        <Link href="/" className="header-logo">NOVA <span>ROMA</span></Link>
        <span className="header-tag">Painel de Administração</span>
      </header>

      <main className="adm-main">
        <div className="top-bar">
          <h1 className="page-title">Produtos</h1>
          <Link href="/adeeme/criar" className="btn">+ Novo Produto</Link>
        </div>

        {produtos.length === 0 ? (
          <div className="empty">Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="produtos-grid">
            {produtos.map(p => (
              <div className="produto-card" key={p.id}>
                {p.foto
                  ? <img src={p.foto} alt={p.titulo} className="produto-thumb" />
                  : <div className="produto-thumb-placeholder">Sem foto</div>
                }
                <div className="produto-body">
                  <p className="produto-titulo">{p.titulo}</p>
                  <p className="produto-preco">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</p>
                  {p.descricao && <p className="produto-desc">{p.descricao}</p>}
                  <div className="produto-actions">
                    <Link href={`/adeeme/editar/${p.id}`} className="btn-edit">Editar</Link>
                    <Link href={`/adeeme/estoque/${p.id}`} className="btn-edit">Estoque</Link>
                    <button className="btn-danger" onClick={() => deletar(p.id, p.titulo)}>Deletar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
