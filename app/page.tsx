'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { supabase, Produto, FotoProduto } from '@/lib/supabase'
import { CartProvider, useCart } from '@/contexts/CartContext'
import CartSidebar from '@/components/CartSidebar'
import Toast from '@/components/Toast'

type ProdutoComFoto = Produto & { foto?: string }

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
      <img src="/images/LOGOMARCA.png" alt="Nova Roma" id="splash-logo" />
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
          <img src="/images/logo.png" alt="Nova Roma" style={{ height: 110 }} />
          <span className="logo-wordmark">NOVA <span>ROMA</span></span>
        </Link>
        <ul className="nav-links">
          <li><a href="#colecao">Coleção</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
        <button className="nav-cart" onClick={toggleCart}>
          Carrinho
          <span className="cart-count">{count}</span>
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
              <img src={src} alt="Nova Roma" />
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
              <img src={src} alt="Nova Roma" />
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
  const { showToast } = useCart()
  const { current: polaroidCurrent, setCurrent: setPolaroidCurrent } = usePolaroid()

  useEffect(() => {
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
    load()
  }, [])

  function subscribe() {
    if (nlEmail.includes('@')) {
      showToast('Inscrito com sucesso!')
      setNlEmail('')
    } else {
      showToast('Digite um email válido.')
    }
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
          <div className="hero-stamp">
            <span>EST</span>
            <span className="stamp-yr">2025</span>
            <span>Recife</span>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker">
        <div className="ticker-track">
          <span className="ticker-item">Leão</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Timbu</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Cobra Coral</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Nova Roma · Recife · PE</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Feito com Orgulho Nordestino</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Leão</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Timbu</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Cobra Coral</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Nova Roma · Recife · PE</span><span className="ticker-sep">◆</span>
          <span className="ticker-item">Feito com Orgulho Nordestino</span><span className="ticker-sep">◆</span>
        </div>
      </div>

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
                    ? <img src={p.foto} alt={p.titulo} />
                    : <div className="polaroid-no-foto">Sem foto</div>
                  }
                  <div className="polaroid-hover-btn">
                    <span className="prod-add">Ver Produto</span>
                  </div>
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
        <div>
          <p className="section-eyebrow">Nossa história</p>
          <h2 className="section-title">FEITO POR<br />TORCEDORES</h2>
          <blockquote className="manifesto-quote">"Futebol pernambucano é fé, raça e identidade."</blockquote>
          <p className="manifesto-body">
            A Nova Roma nasceu nas ruas do Recife, onde futebol e cultura se fundem em paixão pura. Cada camiseta é um manifesto — de quem vai ao estádio, de quem grita na quebrada, de quem carrega o escudo no peito além das quatro linhas.<br /><br />
            Produção local, tecidos de qualidade, design que respeita a história dos três gigantes do estado. Sem rodeios, sem modinha. Só orgulho pernambucano de verdade.
          </p>
        </div>
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
              <img src="/images/logo.png" alt="Nova Roma" style={{ height: 50, filter: 'brightness(0) invert(1)' }} />
              <span className="footer-logo-text">NOVA <span>ROMA</span></span>
            </div>
            <p className="footer-tag">Streetwear pernambucano feito por torcedores, para torcedores. Recife, PE.</p>
          </div>
          <div className="footer-col">
            <h4>Coleções</h4>
            <ul>
              <li>Leão Collection</li>
              <li>Timbu Collection</li>
              <li>Cobra Coral Collection</li>
              <li>Collab Drops</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Informações</h4>
            <ul>
              <li>Sobre Nós</li>
              <li>Guia de Tamanhos</li>
              <li>Política de Troca</li>
              <li>Frete e Entrega</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contato</h4>
            <ul>
              <li>contato@novaroma.com</li>
              <li>Recife — PE</li>
              <li>Instagram</li>
              <li>WhatsApp</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p className="footer-copy">© 2025 Nova Roma — Todos os direitos reservados</p>
          <div className="footer-socials">
            <a href="#">Instagram</a>
            <a href="#">TikTok</a>
            <a href="#">WhatsApp</a>
          </div>
        </div>
      </footer>

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
