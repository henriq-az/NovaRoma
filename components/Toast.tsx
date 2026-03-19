'use client'

import { useCart } from '@/contexts/CartContext'

export default function Toast() {
  const { toast } = useCart()
  return <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>
}
