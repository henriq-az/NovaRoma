'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type CartItem = {
  produto_id: number
  name: string
  tamanho: string
  price: number
  qty: number
}

type Cupom = {
  codigo: string
  cupomId: number
  tipo: 'percentual' | 'fixo'
  valor: number
}

type CartContextType = {
  cart: CartItem[]
  cartOpen: boolean
  toast: string
  addItem: (produto_id: number, name: string, tamanho: string, price: number) => void
  removeItem: (produto_id: number, tamanho: string) => void
  toggleCart: () => void
  showToast: (msg: string) => void
  total: number
  desconto: number
  totalFinal: number
  count: number
  cupom: Cupom | null
  applyCoupon: (codigo: string) => Promise<{ ok: boolean; error?: string }>
  removeCoupon: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')
  const [cupom, setCupom] = useState<Cupom | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2400)
  }, [])

  const addItem = useCallback((produto_id: number, name: string, tamanho: string, price: number) => {
    setCart(prev => {
      const key = `${produto_id}-${tamanho}`
      const ex = prev.find(i => `${i.produto_id}-${i.tamanho}` === key)
      if (ex) return prev.map(i => `${i.produto_id}-${i.tamanho}` === key ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { produto_id, name, tamanho, price, qty: 1 }]
    })
    showToast(`${name} (${tamanho}) adicionado!`)
  }, [showToast])

  const removeItem = useCallback((produto_id: number, tamanho: string) => {
    setCart(prev => prev.filter(i => !(i.produto_id === produto_id && i.tamanho === tamanho)))
  }, [])

  const toggleCart = useCallback(() => setCartOpen(v => !v), [])

  const removeCoupon = useCallback(() => setCupom(null), [])

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const desconto = cupom
    ? cupom.tipo === 'percentual'
      ? Math.min(total * (cupom.valor / 100), total)
      : Math.min(cupom.valor, total)
    : 0

  const totalFinal = Math.max(0, total - desconto)

  const applyCoupon = useCallback(async (codigo: string): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch('/api/cupons/validar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, total }),
    })
    const data = await res.json()
    if (data.ok) {
      setCupom({ codigo: codigo.toUpperCase().trim(), cupomId: data.cupomId, tipo: data.tipo, valor: data.valor })
      return { ok: true }
    }
    return { ok: false, error: data.error }
  }, [total])

  return (
    <CartContext.Provider value={{
      cart, cartOpen, toast, addItem, removeItem, toggleCart, showToast,
      total, desconto, totalFinal, count: cart.reduce((s, i) => s + i.qty, 0),
      cupom, applyCoupon, removeCoupon,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
