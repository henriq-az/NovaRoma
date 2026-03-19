import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}

// Alias para uso direto como objeto (chamado em useEffect, event handlers)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string, unknown>)[prop as string]
  },
})

export type Produto = {
  id: number
  titulo: string
  preco: number
  descricao: string | null
  criado_em: string
}

export type FotoProduto = {
  id: number
  produto_id: number
  url: string
  ordem: number
}

export type EstoqueItem = {
  id: number
  produto_id: number
  tamanho: 'PP' | 'P' | 'M' | 'G' | 'GG' | 'XG'
  quantidade: number
}
