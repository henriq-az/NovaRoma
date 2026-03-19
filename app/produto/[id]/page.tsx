'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Produto, FotoProduto, EstoqueItem } from '@/lib/supabase'
import { CartProvider, useCart } from '@/contexts/CartContext'
import CartSidebar from '@/components/CartSidebar'
import Toast from '@/components/Toast'

const TAMANHOS: EstoqueItem['tamanho'][] = ['PP', 'P', 'M', 'G', 'GG', 'XG']

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { toggleCart, count } = useCart()

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo-wrap">
          <img src="/images/logo.png" alt="Nova Roma" style={{ height: 110 }} />
          <span className="logo-wordmark">NOVA <span>ROMA</span></span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/#colecao">Coleção</Link></li>
          <li><Link href="/#sobre">Sobre</Link></li>
          <li><Link href="/#contato">Contato</Link></li>
        </ul>
        <button className="nav-cart" onClick={toggleCart}>
          Carrinho
          <span className="cart-count">{count}</span>
        </button>
        <button
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>
      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        <ul>
          <li><Link href="/#colecao" onClick={() => setMenuOpen(false)}>Coleção</Link></li>
          <li><Link href="/#sobre" onClick={() => setMenuOpen(false)}>Sobre</Link></li>
          <li><Link href="/#contato" onClick={() => setMenuOpen(false)}>Contato</Link></li>
        </ul>
        <button className="btn-primary mobile-cart-btn" onClick={() => { toggleCart(); setMenuOpen(false) }}>
          Carrinho ({count})
        </button>
      </div>
    </>
  )
}

function ProdutoPage() {
  const { id } = useParams()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [fotos, setFotos] = useState<FotoProduto[]>([])
  const [estoque, setEstoque] = useState<EstoqueItem[]>([])
  const [fotoAtual, setFotoAtual] = useState(0)
  const [tamSelecionado, setTamSelecionado] = useState<string | null>(null)
  const [tamErro, setTamErro] = useState(false)
  const [lbOpen, setLbOpen] = useState(false)
  const { addItem, toggleCart } = useCart()

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('produtos').select('*').eq('id', id).single()
      const { data: f } = await supabase.from('fotos_produto').select('*').eq('produto_id', id).order('ordem')
      const { data: e } = await supabase.from('estoque_itens').select('*').eq('produto_id', id)
      if (p) setProduto(p)
      if (f) setFotos(f)
      if (e) setEstoque(e)
    }
    load()
  }, [id])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') navFoto(-1)
      if (e.key === 'ArrowRight') navFoto(1)
      if (e.key === 'Escape') setLbOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [fotos.length, fotoAtual])

  function navFoto(dir: number) {
    setFotoAtual(c => (c + dir + fotos.length) % fotos.length)
  }

  function adicionarAoCarrinho() {
    if (!tamSelecionado) {
      setTamErro(true)
      setTimeout(() => setTamErro(false), 2000)
      return
    }
    addItem(`${produto!.titulo} (${tamSelecionado})`, Number(produto!.preco))
    toggleCart()
  }

  function getQtd(tam: string) {
    return estoque.find(e => e.tamanho === tam)?.quantidade ?? 0
  }

  if (!produto) return null

  return (
    <>
      <Nav />

      <div className="pd-page">

        {/* THUMB STRIP */}
        <div className="pd-thumbstrip" id="pd-thumbstrip">
          {fotos.map((foto, i) => (
            <img
              key={foto.id}
              src={foto.url}
              className={`pd-thumb${i === fotoAtual ? ' ativo' : ''}`}
              onClick={() => setFotoAtual(i)}
              alt={`Foto ${i + 1}`}
            />
          ))}
        </div>

        {/* GALLERY */}
        <div className="pd-gallery">
          <div className="pd-gallery-inner" id="pd-gallery-inner" onClick={() => fotos.length > 0 && setLbOpen(true)}>
            {fotos.length > 0 ? fotos.map((foto, i) => (
              <div key={foto.id} className={`pd-gallery-img${i === fotoAtual ? ' ativo' : ''}`}>
                <img src={foto.url} alt={produto.titulo} />
              </div>
            )) : (
              <div className="pd-gallery-img ativo">
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brown-light)', fontFamily: "'Economica', sans-serif", fontSize: '0.62rem', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
                  Sem foto
                </div>
              </div>
            )}
            <div className="pd-gallery-grain" />
            <span className="pd-badge">Nova Roma · Coleção Nosso Bairrismo</span>
            {fotos.length > 1 && (
              <>
                <button className="pd-arrow pd-arrow-prev" onClick={e => { e.stopPropagation(); navFoto(-1) }}>←</button>
                <button className="pd-arrow pd-arrow-next" onClick={e => { e.stopPropagation(); navFoto(1) }}>→</button>
              </>
            )}
          </div>
        </div>

        {/* INFO */}
        <div className="pd-info">
          <p className="pd-eyebrow">Nova Roma · Streetwear Pernambucano</p>
          <h1 className="pd-titulo">{produto.titulo}</h1>

          <div className="pd-preco-wrap">
            <span className="pd-preco-label">Preço</span>
            <span className="pd-preco">R$&nbsp;{Number(produto.preco).toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="pd-divider" />

          {produto.descricao && <p className="pd-desc">{produto.descricao}</p>}

          <p className={`pd-tam-label${tamErro ? ' erro' : ''}`}>
            {tamErro ? 'Selecione um tamanho' : 'Selecione o tamanho'}
          </p>
          <div className="pd-tamanhos">
            {TAMANHOS.map(t => {
              const disponivel = getQtd(t) > 0
              return (
                <button
                  key={t}
                  className={`pd-tam${tamSelecionado === t ? ' selecionado' : ''}${!disponivel ? ' indisponivel' : ''}`}
                  onClick={() => disponivel && setTamSelecionado(t)}
                  style={!disponivel ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
                  disabled={!disponivel}
                >
                  {t}
                </button>
              )
            })}
          </div>

          <div className="pd-cta">
            <button className="pd-btn-cart" onClick={adicionarAoCarrinho}>
              <span>+ Adicionar ao Carrinho</span>
            </button>
            <Link href="/#colecao" className="pd-voltar">Voltar à coleção</Link>
          </div>

          <div className="pd-detalhes">
            <div className="pd-det-item">
              <span className="pd-det-label">Marca</span>
              <span className="pd-det-val">Nova Roma</span>
            </div>
            <div className="pd-det-item">
              <span className="pd-det-label">Origem</span>
              <span className="pd-det-val">Recife, PE</span>
            </div>
            <div className="pd-det-item">
              <span className="pd-det-label">Material</span>
              <span className="pd-det-val">100% Algodão</span>
            </div>
            <div className="pd-det-item">
              <span className="pd-det-label">Coleção</span>
              <span className="pd-det-val">Nosso Bairrismo</span>
            </div>
          </div>
        </div>
      </div>

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="lb-overlay open" onClick={() => setLbOpen(false)}>
          <button className="lb-close" onClick={() => setLbOpen(false)}>✕</button>
          <img className="lb-img" src={fotos[fotoAtual]?.url} alt="" />
          {fotos.length > 1 && (
            <>
              <button className="lb-arrow lb-arrow-prev" onClick={e => { e.stopPropagation(); navFoto(-1) }}>←</button>
              <button className="lb-arrow lb-arrow-next" onClick={e => { e.stopPropagation(); navFoto(1) }}>→</button>
              <span className="lb-counter">{fotoAtual + 1} / {fotos.length}</span>
            </>
          )}
        </div>
      )}

      <CartSidebar />
      <Toast />
    </>
  )
}

export default function ProdutoDetalhe() {
  return (
    <CartProvider>
      <ProdutoPage />
    </CartProvider>
  )
}
