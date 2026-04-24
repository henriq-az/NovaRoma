'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Produto, FotoProduto } from '@/lib/supabase'
import { CartProvider, useCart } from '@/contexts/CartContext'
import CartSidebar from '@/components/CartSidebar'
import Toast from '@/components/Toast'
import TextReveal from '@/components/TextReveal'

type ProdutoComFoto = Produto & { foto?: string; esgotado?: boolean }

const TICKER_ITEMS = [
  'Nordestino', 'Leão', 'Timbu', 'Cobra Coral',
  'Nova Roma · Recife · PE', 'Feito com Orgulho Nordestino',
]

function Ticker() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function makeSet() {
      const wrap = document.createElement('span')
      wrap.className = 'ticker-set'
      TICKER_ITEMS.forEach(item => {
        const s = document.createElement('span')
        s.className = 'ticker-item'
        s.textContent = item
        wrap.appendChild(s)
        const sep = document.createElement('span')
        sep.className = 'ticker-sep'
        sep.textContent = '◆'
        wrap.appendChild(sep)
      })
      return wrap
    }

    track.innerHTML = ''
    track.appendChild(makeSet())
    track.appendChild(makeSet())

    let x = 0
    let raf: number

    const tick = () => {
      x -= 1

      const first = track.firstElementChild as HTMLElement | null
      if (first && first.offsetWidth > 0 && x + first.offsetWidth <= 0) {
        x += first.offsetWidth
        track.removeChild(first)
        track.appendChild(makeSet())
      }

      track.style.transform = `translateX(${x}px)`
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="ticker" aria-hidden="true">
      <div ref={trackRef} className="ticker-track" />
    </div>
  )
}

const carouselImages = [
  '/images/carrosel/1.jpg',
  '/images/carrosel/2.jpg',
  '/images/carrosel/3.JPG',
  '/images/carrosel/4.JPG',
]

function Splash() {
  const [hidden, setHidden] = useState(false)
  const [show, setShow] = useState(true)

  useEffect(() => {
    if (sessionStorage.getItem('splashShown')) { setShow(false); return }
    sessionStorage.setItem('splashShown', '1')
    const t = setTimeout(() => {
      setHidden(true)
      setTimeout(() => setShow(false), 900)
    }, 1800)
    return () => clearTimeout(t)
  }, [])

  if (!show) return null
  return (
    <div id="splash" className={hidden ? 'hide' : ''}>
      <Image src="/images/LOGOMARCA.png" alt="Nova Roma" id="splash-logo" width={320} height={160} style={{ width: 'auto', height: 'auto' }} />
      <p id="splash-nome">Nova Roma</p>
    </div>
  )
}

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
          <li><a href="#colecao">Coleção</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
        <button className="nav-cart" onClick={toggleCart}>
          Carrinho
          {count > 0 && <span className="cart-count">{count}</span>}
        </button>
        <button
          className={`menu-toggle${menuOpen ? ' active' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          id="menu-toggle"
        >
          <span /><span /><span />
        </button>
      </nav>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`} id="mobile-menu">
        <ul>
          <li><a href="#colecao" onClick={() => setMenuOpen(false)}>Coleção</a></li>
          <li><a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</a></li>
          <li><a href="#contato" onClick={() => setMenuOpen(false)}>Contato</a></li>
        </ul>
        <button className="btn-primary mobile-cart-btn" onClick={() => { toggleCart(); setMenuOpen(false) }}>
          Carrinho ({count})
        </button>
      </div>
    </>
  )
}


function usePolaroid() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setCurrent(c => (c + 1) % carouselImages.length), 3600)
    return () => clearInterval(t)
  }, [])
  return { current, setCurrent }
}


function HeroPolaroidDesktop({ current, setCurrent }: { current: number, setCurrent: (i: number) => void }) {
  return (
    <div className="hero-polaroid-wrap">
      <div className="polaroid">
        <div className="polaroid-slides">
          {carouselImages.map((src, i) => (
            <div key={src} className={`polaroid-slide${i === current ? ' active' : ''}`} style={{ background: '#2a1a0e' }}>
              <Image src={src} alt="Nova Roma" fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="polaroid-dots">
        {carouselImages.map((_, i) => (
          <button key={i} className={`polaroid-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}

function HeroPolaroidMobile({ current, setCurrent }: { current: number, setCurrent: (i: number) => void }) {
  return (
    <div className="hero-mobile-polaroid">
      <div className="polaroid">
        <div className="polaroid-slides">
          {carouselImages.map((src, i) => (
            <div key={src} className={`polaroid-slide${i === current ? ' active' : ''}`} style={{ background: '#2a1a0e' }}>
              <Image src={src} alt="Nova Roma" fill style={{ objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="polaroid-dots" style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}>
        {carouselImages.map((_, i) => (
          <button key={i} className={`polaroid-dot${i === current ? ' active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  )
}

function HomePage() {
  const [produtos, setProdutos] = useState<ProdutoComFoto[]>([])
  const [nlEmail, setNlEmail] = useState('')
  const [guiaOpen, setGuiaOpen] = useState(false)
  const { showToast } = useCart()
  const { current: polaroidCurrent, setCurrent: setPolaroidCurrent } = usePolaroid()

  useEffect(() => {
    async function load() {
      const { data: prods } = await supabase.from('produtos').select('*').order('criado_em', { ascending: false })
      if (!prods) return
      const [{ data: fotos }, { data: estoques }] = await Promise.all([
        supabase.from('fotos_produto').select('*').order('ordem'),
        supabase.from('estoque_itens').select('produto_id, quantidade'),
      ])
      const fotoMap: Record<number, string> = {}
      fotos?.forEach((f: FotoProduto) => {
        if (!fotoMap[f.produto_id]) fotoMap[f.produto_id] = f.url
      })
      const stockMap: Record<number, { hasEntries: boolean; hasStock: boolean }> = {}
      estoques?.forEach((e: { produto_id: number; quantidade: number }) => {
        if (!stockMap[e.produto_id]) stockMap[e.produto_id] = { hasEntries: false, hasStock: false }
        stockMap[e.produto_id].hasEntries = true
        if (e.quantidade > 0) stockMap[e.produto_id].hasStock = true
      })
      setProdutos(prods.map((p: Produto) => ({
        ...p,
        foto: fotoMap[p.id],
        esgotado: stockMap[p.id]?.hasEntries === true && stockMap[p.id]?.hasStock === false,
      })))
    }
    load()
  }, [])

  async function subscribe() {
    if (!nlEmail.includes('@')) { showToast('Digite um email válido.'); return }
    const res = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nlEmail }),
    })
    const json = await res.json()
    if (json.ok) { showToast('Inscrito com sucesso!'); setNlEmail('') }
    else if (json.error === 'ja_cadastrado') showToast('Este email já está cadastrado.')
    else showToast('Digite um email válido.')
  }

  return (
    <>
      <Splash />
      <Nav />

      {/* HERO */}
      <section className="hero">
        <div className="hero-left">
          <p className="hero-eyebrow">Streetwear · Recife · Pernambuco</p>

          <HeroPolaroidMobile current={polaroidCurrent} setCurrent={setPolaroidCurrent} />

          <h1 className="hero-title">
            <span className="hero-outline">CRIADO POR</span>
            <span className="brown">TORCEDORES</span>
            USADO POR TORCEDORES
          </h1>
          <p className="hero-desc">
            Moda streetwear que carrega a alma dos maiores clubes de Pernambuco. Do Recife para o mundo, com a garra do futebol nordestino em cada detalhe.
          </p>
          <div className="scroll-hint">
            <span className="scroll-line" />
            Scroll
          </div>
        </div>
        <div className="hero-right">
          <div className="hero-right-pattern" />
          <div className="hero-right-block" />
          <HeroPolaroidDesktop current={polaroidCurrent} setCurrent={setPolaroidCurrent} />
        </div>
      </section>


      {/* COLEÇÃO */}
      <section className="section" id="colecao" style={{ background: '#C49A6C' }}>
        <p className="section-eyebrow">Nova Coleção</p>
        <h2 className="section-title">Nosso Bairrismo</h2>
        <div className="products-grid" id="grid">
          {produtos.length === 0 ? (
            <p style={{ color: '#fff', fontSize: '0.9rem', letterSpacing: '0.06em', padding: '2rem 0' }}>
              Nenhum produto cadastrado ainda.
            </p>
          ) : (
            produtos.map(p => (
              <Link key={p.id} href={`/produto/${p.id}`} className="polaroid-product">
                <div className="polaroid-img-wrap">
                  {p.foto
                    ? <Image src={p.foto} alt={p.titulo} fill style={{ objectFit: 'cover' }} />
                    : <div className="polaroid-no-foto">Sem foto</div>
                  }
                  {p.esgotado && (
                    <div className="polaroid-esgotado">Esgotado</div>
                  )}
                  {!p.esgotado && (
                    <div className="polaroid-hover-btn">
                      <span className="prod-add">Ver Produto</span>
                    </div>
                  )}
                </div>
                <div className="polaroid-caption">
                  <p className="prod-name">{p.titulo}</p>
                  <p className="prod-price">R$&nbsp;{Number(p.preco).toFixed(2).replace('.', ',')}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto" id="sobre">
        <TextReveal>
          <p className="section-eyebrow">Nossa história</p>
          <h2 className="section-title">FEITO POR<br />TORCEDORES</h2>
          <blockquote className="manifesto-quote">"Futebol pernambucano é fé, raça e identidade."</blockquote>
          <p className="manifesto-body">
            A Nova Roma nasceu nas ruas do Recife, onde futebol e cultura se fundem em paixão pura. Cada camiseta é um manifesto — de quem vai ao estádio, de quem grita na quebrada, de quem carrega o escudo no peito além das quatro linhas.
          </p>
          <p className="manifesto-body">
            Produção local, tecidos de qualidade, design que respeita a história dos três gigantes do estado. Sem rodeios, sem modinha. Só orgulho pernambucano de verdade.
          </p>
        </TextReveal>
        <div className="manifesto-visual">
          <div className="mv-b"><span className="mv-txt">LEÃO<br />DO NORTE</span></div>
          <div className="mv-b"><span className="mv-txt">O<br />TIMBU</span></div>
          <div className="mv-b"><span className="mv-txt">TRICOLOR<br />DO NE</span></div>
          <div className="mv-b"><span className="mv-txt">EST.<br />1901</span></div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="newsletter" id="contato">
        <p className="section-eyebrow">Fique por dentro</p>
        <h2 className="section-title">PRÓXIMO DROP<br />EM BREVE</h2>
        <p className="nl-sub">Acesso antecipado para quem é fiel ao clube.</p>
        <div className="nl-form">
          <input
            type="email"
            className="nl-input"
            placeholder="seu@email.com"
            value={nlEmail}
            onChange={e => setNlEmail(e.target.value)}
          />
          <button className="nl-btn" onClick={subscribe}>Entrar</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo-wrap">
              <Image src="/images/logo.png" alt="Nova Roma" width={200} height={100} style={{ height: 50, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              <span className="footer-logo-text">NOVA <span>ROMA</span></span>
            </div>
            <p className="footer-tag">Streetwear pernambucano feito por torcedores, para torcedores. Recife, PE.</p>
          </div>
          <div className="footer-col">
            <h4>Coleções</h4>
            <ul>
              <li><Link href="/#colecao" className="footer-col-link">Nosso Bairrismo</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Informações</h4>
            <ul>
              <li><Link href="/#sobre" className="footer-col-link">Sobre Nós</Link></li>
              <li><button className="footer-col-link footer-col-btn" onClick={() => setGuiaOpen(true)}>Guia de Tamanhos</button></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <ul>
              <li>novaromafc0@gmail.com</li>
              <li>Recife — PE</li>
              <li>
                <a
                  href="https://instagram.com/novaroma.fc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-col-link"
                >
                  @novaroma.fc
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/5581984717712"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-col-link"
                >
                  (81) 98471-7712
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 Nova Roma — Todos os direitos reservados</p>
          <div className="footer-socials">
            <a href="https://instagram.com/novaroma.fc" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <span>Instagram</span>
            </a>
            <a href="https://wa.me/5581984717712" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </footer>

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
              <div className="guia-diagram">
                <svg viewBox="0 0 210 236" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M76 22 L28 56 L52 80 L52 190 L158 190 L158 80 L182 56 L134 22 Q118 40 105 40 Q92 40 76 22 Z" stroke="#6B3F1F" strokeWidth="1.4" fill="rgba(196,154,108,0.07)" strokeLinejoin="round"/>
                  <path d="M76 22 Q92 40 105 40 Q118 40 134 22" stroke="#6B3F1F" strokeWidth="1.4" fill="none"/>
                  <line x1="30" y1="80" x2="30" y2="190" stroke="#C49A6C" strokeWidth="1" strokeDasharray="4 3"/>
                  <line x1="30" y1="80" x2="52" y2="80" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <line x1="30" y1="190" x2="52" y2="190" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <polygon points="30,82 27,90 33,90" fill="#C49A6C"/>
                  <polygon points="30,188 27,180 33,180" fill="#C49A6C"/>
                  <text x="10" y="138" fontSize="8.5" fill="#C49A6C" fontFamily="Economica,sans-serif" textAnchor="middle" letterSpacing="2" transform="rotate(-90,10,138)">ALTURA</text>
                  <line x1="52" y1="210" x2="158" y2="210" stroke="#C49A6C" strokeWidth="1" strokeDasharray="4 3"/>
                  <line x1="52" y1="190" x2="52" y2="210" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <line x1="158" y1="190" x2="158" y2="210" stroke="#C49A6C" strokeWidth="1" strokeOpacity="0.4"/>
                  <polygon points="52,210 60,207 60,213" fill="#C49A6C"/>
                  <polygon points="158,210 150,207 150,213" fill="#C49A6C"/>
                  <text x="105" y="228" fontSize="8.5" fill="#C49A6C" fontFamily="Economica,sans-serif" textAnchor="middle" letterSpacing="2">LARGURA</text>
                </svg>
                <p className="guia-diagram-label">medidas em centímetros</p>
              </div>
              <div className="guia-table-wrap">
                <table className="guia-table">
                  <thead>
                    <tr><th>TAM</th><th>Altura</th><th>Largura</th></tr>
                  </thead>
                  <tbody>
                    {[
                      { tam: 'PP', altura: 68, largura: 50 },
                      { tam: 'P',  altura: 70, largura: 56 },
                      { tam: 'M',  altura: 72, largura: 57 },
                      { tam: 'G',  altura: 76, largura: 60 },
                      { tam: 'GG', altura: 79, largura: 63 },
                    ].map(row => (
                      <tr key={row.tam}>
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

      <CartSidebar />
      <Toast />
    </>
  )
}

export default function Home() {
  return (
    <CartProvider>
      <HomePage />
    </CartProvider>
  )
}
