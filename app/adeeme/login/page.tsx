'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setErro('')

    const res = await fetch('/api/adeeme/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/adeeme')
    } else {
      setErro('Senha incorreta.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--white2)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <Image
          src="/images/logo.png"
          alt="Nova Roma"
          width={120}
          height={60}
          style={{ width: 'auto', height: 60, marginBottom: '1rem' }}
        />
        <p style={{
          fontFamily: "'Economica', sans-serif",
          fontSize: '0.65rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Painel de Administração
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoFocus
          style={{
            padding: '14px 16px',
            border: `1px solid ${erro ? '#CC0000' : 'rgba(107,63,31,0.25)'}`,
            background: '#fff',
            fontFamily: "'Economica', sans-serif",
            fontSize: '1rem',
            color: 'var(--text-dark)',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {erro && (
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: '0.75rem',
            color: '#CC0000',
            margin: 0,
          }}>
            {erro}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          style={{
            background: 'var(--brown-dark)',
            color: '#fff',
            border: 'none',
            padding: '14px',
            fontFamily: "'Economica', sans-serif",
            fontWeight: 700,
            fontSize: '0.8rem',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            cursor: loading || !password ? 'not-allowed' : 'pointer',
            opacity: loading || !password ? 0.6 : 1,
          }}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
