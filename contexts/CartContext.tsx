'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type CartItem = {
  produto_id: number
  name: string
  tamanho: string
  price: number
  qty: number
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
  count: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [toast, setToast] = useState('')

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

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const count = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <CartContext.Provider value={{ cart, cartOpen, toast, addItem, removeItem, toggleCart, showToast, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be inside CartProvider')
  return ctx
}
