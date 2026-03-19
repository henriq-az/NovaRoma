'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type CartItem = {
  name: string
  price: number
  qty: number
}

type CartContextType = {
  cart: CartItem[]
  cartOpen: boolean
  toast: string
  addItem: (name: string, price: number) => void
  removeItem: (name: string) => void
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

  const addItem = useCallback((name: string, price: number) => {
    setCart(prev => {
      const ex = prev.find(i => i.name === name)
      if (ex) return prev.map(i => i.name === name ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { name, price, qty: 1 }]
    })
    showToast(`${name} adicionado!`)
  }, [showToast])

  const removeItem = useCallback((name: string) => {
    setCart(prev => prev.filter(i => i.name !== name))
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
