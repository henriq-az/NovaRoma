import Link from 'next/link'

export default function PedidoFalha() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--white2)', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <p style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✕</p>
        <h1 style={{ fontFamily: "'Jost', sans-serif", fontWeight: 900, fontSize: '1.8rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--brown-dark)', marginBottom: '1rem' }}>
          Algo deu errado
        </h1>
        <p style={{ fontFamily: "'Economica', sans-serif", fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Não conseguimos processar seu pagamento. Verifique os dados do cartão e tente novamente.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ display: 'inline-block', background: 'transparent', color: 'var(--brown)', border: '1px solid var(--brown)', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 36px', textDecoration: 'none' }}>
            Voltar à Loja
          </Link>
          <Link href="/#colecao" style={{ display: 'inline-block', background: 'var(--brown)', color: '#fff', fontFamily: "'Economica', sans-serif", fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.18em', textTransform: 'uppercase', padding: '14px 36px', textDecoration: 'none' }}>
            Ver Produtos
          </Link>
        </div>
      </div>
    </div>
  )
}
