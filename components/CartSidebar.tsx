'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'

export default function CartSidebar() {
  const { cart, cartOpen, toggleCart, removeItem, total } = useCart()
  const [loading, setLoading] = useState(false)

  async function finalizarPedido() {
    if (cart.length === 0) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens: cart }),
      })
      const data = await res.json()
      if (data.checkout_url) {
        window.location.href = data.checkout_url
      } else {
        alert('Erro ao iniciar checkout. Tente novamente.')
        setLoading(false)
      }
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`cart-overlay${cartOpen ? ' show' : ''}`} onClick={toggleCart} />
      <div className={`cart-sidebar${cartOpen ? ' open' : ''}`}>
        <div className="cart-hdr">
          <h3 className="cart-hdr-title">Carrinho</h3>
          <button className="cart-close" onClick={toggleCart}>✕</button>
        </div>
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="cart-empty">Seu carrinho está vazio.</div>
          ) : (
            cart.map(item => (
              <div className="cart-item" key={`${item.produto_id}-${item.tamanho}`}>
                <div className="cart-item-thumb">👕</div>
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-sub">TAM: {item.tamanho} · QTD: {item.qty}</p>
                </div>
                <span className="cart-item-price">
                  R$&nbsp;{(item.price * item.qty).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <button className="cart-rm" onClick={() => removeItem(item.produto_id, item.tamanho)}>✕</button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-ftr">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-val">
                R$&nbsp;{total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', padding: '16px', textAlign: 'center', opacity: loading ? 0.7 : 1 }}
              onClick={finalizarPedido}
              disabled={loading}
            >
              {loading ? 'Aguarde...' : 'Finalizar Pedido'}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
