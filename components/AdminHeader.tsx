'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminHeader() {
  const router = useRouter()

  async function logout() {
    await fetch('/api/adeeme/logout', { method: 'POST' })
    router.push('/adeeme/login')
  }

  return (
    <header className="adm-header">
      <Link href="/" className="header-logo">NOVA <span>ROMA</span></Link>
      <span className="header-tag">Painel de Administração</span>
      <button
        onClick={logout}
        style={{
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.25)',
          color: 'rgba(255,255,255,0.6)',
          padding: '6px 18px',
          fontFamily: "'Economica', sans-serif",
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          cursor: 'pointer',
        }}
      >
        Sair
      </button>
    </header>
  )
}
