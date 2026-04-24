'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase, Produto, FotoProduto, EstoqueItem } from '@/lib/supabase'
import Image from 'next/image'
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
          <Image src="/images/logo.png" alt="Nova Roma" width={220} height={110} style={{ height: 110, width: 'auto' }} />
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
  const [guiaOpen, setGuiaOpen] = useState(false)
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
      if (e.key === 'Escape') { setLbOpen(false); setGuiaOpen(false) }
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
    addItem(produto!.id, produto!.titulo, tamSelecionado, Number(produto!.preco))
    toggleCart()
  }

  function getQtd(tam: string) {
    return estoque.find(e => e.tamanho === tam)?.quantidade ?? 0
  }

  const esgotado = estoque.length > 0 && !TAMANHOS.some(t => getQtd(t) > 0)

  if (!produto) return null

  return (
    <>
      <Nav />

      <div className="pd-page">

        {/* THUMB STRIP */}
        <div className="pd-thumbstrip" id="pd-thumbstrip">
          {fotos.map((foto, i) => (
            <Image
              key={foto.id}
              src={foto.url}
              width={44}
              height={52}
              className={`pd-thumb${i === fotoAtual ? ' ativo' : ''}`}
              onClick={() => setFotoAtual(i)}
              alt={`Foto ${i + 1}`}
              style={{ objectFit: 'cover' }}
            />
          ))}
        </div>

        {/* GALLERY */}
        <div className="pd-gallery">
          <div className="pd-gallery-inner" id="pd-gallery-inner" onClick={() => fotos.length > 0 && setLbOpen(true)}>
            {fotos.length > 0 ? fotos.map((foto, i) => (
              <div key={foto.id} className={`pd-gallery-img${i === fotoAtual ? ' ativo' : ''}`}>
                <Image src={foto.url} alt={produto.titulo} fill style={{ objectFit: 'cover' }} />
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
            {esgotado && (
              <span style={{ marginLeft: 12, padding: '4px 12px', background: '#fdecea', color: '#CC0000', fontFamily: "'Jost', sans-serif", fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Esgotado
              </span>
            )}
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
          <button className="pd-guia-btn" onClick={() => setGuiaOpen(true)}>
            Guia de Tamanhos →
          </button>

          <div className="pd-cta">
            {esgotado ? (
              <button className="pd-btn-cart" disabled style={{ opacity: 0.45, cursor: 'not-allowed' }}>
                <span>Produto Esgotado</span>
              </button>
            ) : (
              <button className="pd-btn-cart" onClick={adicionarAoCarrinho}>
                <span>+ Adicionar ao Carrinho</span>
              </button>
            )}
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

      {/* GUIA DE TAMANHOS */}
      {guiaOpen && (
        <div className="guia-overlay" onClick={() => setGuiaOpen(false)}>
          <div className="guia-modal" onClick={e => e.stopPropagation()}>

            <div className="guia-hdr">
              <div>
                <p className="guia-eyebrow">Modelagem Oversized</p>
                <h2 className="guia-title">Guia de Tamanhos</h2>
              </div>
              <button className="guia-close" onClick={() => setGuiaOpen(false)}>✕</button>
            </div>

            <div className="guia-body">
              {/* Diagrama SVG */}
              <div className="guia-diagram">
                <svg viewBox="0 0 210 236" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Corpo da camiseta */}
                  <path
                    d="M76 22 L28 56 L52 80 L52 190 L158 190 L158 80 L182 56 L134 22 Q118 40 105 40 Q92 40 76 22 Z"
                    stroke="#6B3F1F" strokeWidth="1.4" fill="rgba(196,154,108,0.07)" strokeLinejoin="round"
                  />
                  {/* Gola */}
                  <path d="M76 22 Q92 40 105 40 Q118 40 134 22" stroke="#6B3F1F" strokeWidth="1.4" fill="none"/>

                  {/* Seta Altura — vertical esquerda */}
                  <line x1="30" y1="80" x2="30" y2="190" stroke="#C49A6C" strokeWidth="1" strokeDasharray="4 3"/>
                  <line x1="30" y1="80" x2="52" y2="80" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <line x1="30" y1="190" x2="52" y2="190" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <polygon points="30,82 27,90 33,90" fill="#C49A6C"/>
                  <polygon points="30,188 27,180 33,180" fill="#C49A6C"/>
                  <text x="10" y="138" fontSize="8.5" fill="#C49A6C" fontFamily="Economica,sans-serif"
                    textAnchor="middle" letterSpacing="2" transform="rotate(-90,10,138)">ALTURA</text>

                  {/* Seta Largura — horizontal inferior */}
                  <line x1="52" y1="210" x2="158" y2="210" stroke="#C49A6C" strokeWidth="1" strokeDasharray="4 3"/>
                  <line x1="52" y1="190" x2="52" y2="210" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <line x1="158" y1="190" x2="158" y2="210" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <polygon points="52,210 60,207 60,213" fill="#C49A6C"/>
                  <polygon points="158,210 150,207 150,213" fill="#C49A6C"/>
                  <text x="105" y="228" fontSize="8.5" fill="#C49A6C" fontFamily="Economica,sans-serif"
                    textAnchor="middle" letterSpacing="2">LARGURA</text>
                </svg>
                <p className="guia-diagram-label">medidas em centímetros</p>
              </div>

              {/* Tabela */}
              <div className="guia-table-wrap">
                {tamSelecionado && (
                  <div className="guia-selected-tag">
                    Selecionado: <strong>{tamSelecionado}</strong>
                  </div>
                )}
                <table className="guia-table">
                  <thead>
                    <tr>
                      <th>TAM</th>
                      <th>Altura</th>
                      <th>Largura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { tam: 'PP', altura: 68, largura: 50 },
                      { tam: 'P',  altura: 70, largura: 56 },
                      { tam: 'M',  altura: 72, largura: 57 },
                      { tam: 'G',  altura: 76, largura: 60 },
                      { tam: 'GG', altura: 79, largura: 63 },
                    ].map(row => (
                      <tr key={row.tam} className={tamSelecionado === row.tam ? 'guia-row-active' : ''}>
                        <td className="guia-td-tam">{row.tam}</td>
                        <td className="guia-td-num">{row.altura}<span className="guia-unit"> cm</span></td>
                        <td className="guia-td-num">{row.largura}<span className="guia-unit"> cm</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* LIGHTBOX */}
      {lbOpen && (
        <div className="lb-overlay open" onClick={() => setLbOpen(false)}>
          <button className="lb-close" onClick={() => setLbOpen(false)}>✕</button>
          <Image className="lb-img" src={fotos[fotoAtual]?.url ?? ''} alt="" width={1200} height={1200} style={{ objectFit: 'contain', width: 'auto', height: 'auto' }} />
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
