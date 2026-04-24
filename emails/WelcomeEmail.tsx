import {
  Body, Container, Font, Head, Heading, Hr, Html,
  Preview, Section, Text,
} from '@react-email/components'

export interface WelcomeEmailProps {
  nome?: string
}

export function WelcomeEmail({ nome }: WelcomeEmailProps) {
  const saudacao = nome ? `Bem-vindo, ${nome}.` : 'Bem-vindo à Nova Roma.'

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

      <Preview>{saudacao} Acesso antecipado aos próximos drops.</Preview>

      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerLogo}>NOVA ROMA</Text>
            <Text style={headerSub}>Streetwear Pernambucano</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>{saudacao}</Heading>

            <Text style={para}>
              Você agora faz parte da lista Nova Roma — os primeiros a saber quando um novo drop estiver no ar.
            </Text>

            <Text style={para}>
              Feito no Recife, com a garra do futebol nordestino em cada peça. Obrigado por estar aqui.
            </Text>

            <Hr style={divider} />

            <Text style={manifesto}>
              "Futebol pernambucano é fé, raça e identidade."
            </Text>

            <Hr style={divider} />

            <Text style={footer}>
              Nova Roma — Recife, PE · contato@novaroma.com.br<br />
              Para cancelar a inscrição, responda este e-mail.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default WelcomeEmail

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
  margin: '0 0 20px',
}

const para: React.CSSProperties = {
  color: '#555',
  fontSize: '0.95rem',
  lineHeight: 1.7,
  margin: '0 0 16px',
}

const divider: React.CSSProperties = {
  borderColor: '#e8ddd4',
  margin: '20px 0',
}

const manifesto: React.CSSProperties = {
  fontFamily: "'Cormorant Garamond', Georgia, serif",
  color: '#6B2737',
  fontSize: '1.1rem',
  fontStyle: 'italic',
  textAlign: 'center',
  margin: 0,
  lineHeight: 1.6,
}

const footer: React.CSSProperties = {
  color: '#b0a090',
  fontSize: '0.72rem',
  textAlign: 'center',
  letterSpacing: '0.06em',
  margin: 0,
  lineHeight: 1.8,
}
