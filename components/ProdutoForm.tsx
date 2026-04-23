'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase, Produto, FotoProduto } from '@/lib/supabase'

type Props = {
  produto?: Produto
  fotos?: FotoProduto[]
}

export default function ProdutoForm({ produto, fotos: fotosIniciais = [] }: Props) {
  const router = useRouter()
  const [titulo, setTitulo] = useState(produto?.titulo ?? '')
  const [preco, setPreco] = useState(produto?.preco?.toString() ?? '')
  const [descricao, setDescricao] = useState(produto?.descricao ?? '')
  const [fotos, setFotos] = useState<FotoProduto[]>(fotosIniciais)
  const [previews, setPreviews] = useState<string[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setPendingFiles(files)
    const urls: string[] = []
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        urls.push(ev.target!.result as string)
        if (urls.length === files.length) setPreviews([...urls])
      }
      reader.readAsDataURL(file)
    })
  }

  async function uploadFoto(file: File, produtoId: number) {
    const ext = file.name.split('.').pop()
    const path = `produtos/${produtoId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
    const { error } = await supabase.storage.from('fotos').upload(path, file)
    if (error) throw error
    return supabase.storage.from('fotos').getPublicUrl(path).data.publicUrl
  }

  async function removerFoto(id: number) {
    await supabase.from('fotos_produto').delete().eq('id', id)
    setFotos(prev => prev.filter(f => f.id !== id))
  }

  async function salvar() {
    setSaving(true)
    try {
      let produtoId = produto?.id

      if (produto) {
        await supabase.from('produtos').update({ titulo, preco: Number(preco), descricao }).eq('id', produto.id)
      } else {
        const { data } = await supabase.from('produtos').insert({ titulo, preco: Number(preco), descricao }).select().single()
        produtoId = data?.id
      }

      if (produtoId && pendingFiles.length > 0) {
        setUploading(true)
        const maxOrdem = fotos.length ? Math.max(...fotos.map(f => f.ordem)) + 1 : 0
        for (let i = 0; i < pendingFiles.length; i++) {
          const url = await uploadFoto(pendingFiles[i], produtoId)
          await supabase.from('fotos_produto').insert({ produto_id: produtoId, url, ordem: maxOrdem + i })
        }
        setUploading(false)
      }

      router.push('/adeeme')
    } finally {
      setSaving(false)
    }
  }

  const isLoading = saving || uploading

  return (
    <main className="adm-main-narrow">
      <Link href="/adeeme" className="back">← Voltar</Link>
      <h1 className="page-title" style={{ marginBottom: '2.5rem' }}>
        {produto ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      <div className="form-card">
        <div className="form-group">
          <label className="adm-label" htmlFor="titulo">Título</label>
          <input
            id="titulo"
            type="text"
            className="adm-input"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            placeholder="Ex: Leão Noir"
          />
        </div>

        <div className="form-group">
          <label className="adm-label" htmlFor="preco">Preço (R$)</label>
          <input
            id="preco"
            type="number"
            className="adm-input"
            value={preco}
            onChange={e => setPreco(e.target.value)}
            placeholder="259.00"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="adm-label" htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            className="adm-input adm-textarea"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            placeholder="Descreva o produto..."
          />
        </div>

        {fotos.length > 0 && (
          <div className="form-group">
            <label className="adm-label">Fotos Atuais</label>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.06em' }}>
              Clique em Remover para excluir uma foto.
            </p>
            <div className="fotos-atuais">
              {fotos.map(f => (
                <div className="foto-item" key={f.id} style={{ aspectRatio: '1' }}>
                  <Image src={f.url} alt="" fill style={{ objectFit: 'cover', display: 'block', border: '1px solid rgba(107,63,31,0.1)' }} />
                  <button className="foto-item-remove" onClick={() => removerFoto(f.id)}>✕ Remover</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="adm-label">{produto ? 'Adicionar Fotos' : 'Fotos'}</label>
          <div className="foto-upload-area" onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={onFileChange} />
            <p className="foto-upload-label">
              Clique para selecionar ou arraste aqui<br />
              <strong>JPG, PNG, WEBP</strong> — múltiplas fotos permitidas
            </p>
          </div>
          {previews.length > 0 && (
            <div className="preview-grid">
              {previews.map((src, i) => <img key={i} src={src} alt="" />)}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-lg" onClick={salvar} disabled={isLoading || !titulo || !preco}>
            {isLoading ? 'Salvando...' : 'Salvar Produto'}
          </button>
          <Link href="/adeeme" className="btn-ghost">Cancelar</Link>
        </div>
      </div>
    </main>
  )
}
