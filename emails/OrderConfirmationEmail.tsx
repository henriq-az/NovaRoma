import {
  Body, Container, Font, Head, Heading, Hr, Html,
  Preview, Row, Column, Section, Text,
} from '@react-email/components'

export interface OrderConfirmationEmailProps {
  nome: string
  pedidoId: string
  itens: { titulo: string; tamanho: string; quantidade: number; preco_unit: number }[]
  total: number
}

export function OrderConfirmationEmail({ nome, pedidoId, itens, total }: OrderConfirmationEmailProps) {
  const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`

  return (
    <Html lang="pt">
      <Head>
        <Font
          fontFamily="Cormorant Garamond"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/cormorantgaramond/v22/co3bmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Cormorant Garamond"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/cormorantgaramond/v22/co3YmX5slCNuHLi8bLeY9MK7whWMhyjYqXtK.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
      </Head>

      <Preview>Pedido confirmado — obrigado, {nome}!</Preview>

      <Body style={body}>
        {/* Header */}
        <Container style={container}>
          <Section style={header}>
            <Text style={headerLogo}>NOVA ROMA</Text>
            <Text style={headerSub}>Streetwear Pernambucano</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Heading style={h1}>Pedido confirmado,<br />{nome}.</Heading>

            <Text style={para}>
              Seu pagamento foi aprovado. Em breve você receberá as informações de rastreamento.
            </Text>

            <Text style={label}>Número do pedido</Text>
            <Text style={orderId}>#{pedidoId.slice(0, 8).toUpperCase()}</Text>

            <Hr style={divider} />

            {/* Items */}
            <Text style={label}>Itens</Text>
            {itens.map((item, i) => (
              <Row key={i} style={itemRow}>
                <Column style={itemName}>
                  {item.titulo}
                  <span style={itemMeta}> · {item.tamanho} · x{item.quantidade}</span>
                </Column>
                <Column style={itemPrice}>{brl(item.preco_unit * item.quantidade)}</Column>
              </Row>
            ))}

            <Hr style={divider} />

            <Row>
              <Column><Text style={totalLabel}>Total</Text></Column>
              <Column style={{ textAlign: 'right' }}>
                <Text style={totalValue}>{brl(total)}</Text>
              </Column>
            </Row>

            <Hr style={divider} />

            <Text style={footer}>
              Nova Roma — Recife, PE · contato@novaroma.com.br
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default OrderConfirmationEmail

// ── Styles ──────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: '#F5F0E8',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  margin: 0,
  padding: '40px 0',
}

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

const header: React.CSSProperties = {
  backgroundColor: '#6B2737',
  padding: '28px 40px',
  textAlign: 'center',
}

const headerLogo: React.CSSProperties = {
  color: '#F5F0E8',
  fontSize: '1.5rem',
  fontWeight: 600,
  letterSpacing: '0.25em',
  margin: 0,
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const headerSub: React.CSSProperties = {
  color: 'rgba(245,240,232,0.6)',
  fontSize: '0.65rem',
  letterSpacing: '0.3em',
  textTransform: 'uppercase',
  margin: '4px 0 0',
}

const content: React.CSSProperties = {
  padding: '36px 40px 40px',
}

const h1: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  color: '#6B2737',
  fontSize: '1.8rem',
  fontWeight: 600,
  lineHeight: 1.25,
  margin: '0 0 16px',
}

const para: React.CSSProperties = {
  color: '#555',
  fontSize: '0.95rem',
  lineHeight: 1.7,
  margin: '0 0 24px',
}

const label: React.CSSProperties = {
  fontSize: '0.6rem',
  letterSpacing: '0.25em',
  textTransform: 'uppercase',
  color: '#9a8878',
  fontWeight: 600,
  margin: '0 0 6px',
}

const orderId: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  color: '#6B2737',
  fontSize: '1.1rem',
  fontWeight: 600,
  margin: '0 0 20px',
  letterSpacing: '0.08em',
}

const divider: React.CSSProperties = {
  borderColor: '#e8ddd4',
  margin: '16px 0',
}

const itemRow: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid #f0e8e0',
}

const itemName: React.CSSProperties = {
  color: '#3d2010',
  fontSize: '0.92rem',
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const itemMeta: React.CSSProperties = {
  color: '#9a8878',
  fontSize: '0.82rem',
}

const itemPrice: React.CSSProperties = {
  color: '#3d2010',
  fontSize: '0.92rem',
  textAlign: 'right',
  fontWeight: 600,
}

const totalLabel: React.CSSProperties = {
  fontSize: '0.65rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#9a8878',
  fontWeight: 600,
  margin: 0,
}

const totalValue: React.CSSProperties = {
  color: '#6B2737',
  fontSize: '1.15rem',
  fontWeight: 600,
  textAlign: 'right',
  margin: 0,
  fontFamily: "'Cormorant Garamond', Georgia, serif",
}

const footer: React.CSSProperties = {
  color: '#b0a090',
  fontSize: '0.72rem',
  textAlign: 'center',
  letterSpacing: '0.06em',
  margin: '8px 0 0',
}
