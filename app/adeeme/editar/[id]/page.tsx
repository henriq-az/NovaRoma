'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ProdutoForm from '@/components/ProdutoForm'
import { supabase, Produto, FotoProduto } from '@/lib/supabase'
import AdminHeader from '@/components/AdminHeader'
import '../../admin.css'

export default function EditarPage() {
  const { id } = useParams()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [fotos, setFotos] = useState<FotoProduto[]>([])

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('produtos').select('*').eq('id', id).single()
      const { data: f } = await supabase.from('fotos_produto').select('*').eq('produto_id', id).order('ordem')
      if (p) setProduto(p)
      if (f) setFotos(f)
    }
    load()
  }, [id])

  return (
    <>
      <AdminHeader />
      {produto
        ? <ProdutoForm produto={produto} fotos={fotos} />
        : <main className="adm-main-narrow"><p style={{ color: 'var(--text-muted)', paddingTop: 48 }}>Carregando...</p></main>
      }
    </>
  )
}
