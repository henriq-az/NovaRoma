import Link from 'next/link'
import ProdutoForm from '@/components/ProdutoForm'
import '../admin.css'

export default function CriarPage() {
  return (
    <>
      <header className="adm-header">
        <Link href="/" className="header-logo">NOVA <span>ROMA</span></Link>
        <span className="header-tag">Painel de Administração</span>
      </header>
      <ProdutoForm />
    </>
  )
}
